'use strict';

var requireHook = require('../../../util/requireHook');
var tracingUtil = require('../../tracingUtil');
var constants = require('../../constants');
var cls = require('../../cls');

var isActive = false;

exports.init = function() {
  requireHook.onModuleLoad('elasticsearch', instrument);
};

function instrument(es) {
  var OriginalClient = es.Client;
  if (!OriginalClient || typeof OriginalClient !== 'function') {
    return;
  }

  es.Client = function InstrumentedClient() {
    var client = OriginalClient.apply(OriginalClient, arguments);
    var clusterInfo = {};

    gatherClusterInfo(client, clusterInfo);

    instrumentApi(client, ['search'], clusterInfo);
    instrumentApi(client, ['index'], clusterInfo);
    instrumentApi(client, ['indices', 'refresh'], clusterInfo);
    instrumentApi(client, ['get'], clusterInfo);
    instrumentApi(client, ['msearch'], clusterInfo);
    instrumentApi(client, ['mget'], clusterInfo);

    return client;
  };
}

function gatherClusterInfo(client, clusterInfo) {
  client.info().then(
    function(_clusterInfo) {
      clusterInfo.clusterName = _clusterInfo.cluster_name;
    },
    function() {
      setTimeout(function() {
        gatherClusterInfo(client, clusterInfo);
      }, 30000).unref();
    }
  );
}

function instrumentApi(client, actionPath, clusterInfo) {
  var action = actionPath.join('.');
  var parent = actionPath.length === 2 ? client[actionPath[0]] : client;
  var originalFunction = actionPath.length === 2 ? client[actionPath[0]][actionPath[1]] : client[actionPath[0]];

  if (typeof originalFunction !== 'function') {
    return;
  }
  parent[actionPath[actionPath.length - 1]] = function instrumentedAction(params, cb) {
    if (!isActive || !cls.isTracing()) {
      return originalFunction.apply(this, arguments);
    }

    var ctx = this;
    var originalArgs = new Array(arguments.length);
    for (var i = 0; i < arguments.length; i++) {
      originalArgs[i] = arguments[i];
    }

    return cls.ns.runAndReturn(function() {
      var span = cls.startSpan('elasticsearch', constants.EXIT);
      span.stack = tracingUtil.getStackTrace(instrumentedAction);
      span.data.elasticsearch = {
        action: action,
        cluster: clusterInfo.clusterName
      };

      if (action === 'mget' && params.body && params.body.docs && Array.isArray(params.body.docs)) {
        getSpanDataFromMget1(span, params.body.docs);
      } else if (action === 'mget' && params.body && params.body.ids && Array.isArray(params.body.ids)) {
        getSpanDataFromMget2(span, params);
      } else if (action === 'msearch' && Array.isArray(params.body)) {
        getSpanDataFromMsearch(span, params.body);
      } else {
        span.data.elasticsearch.index = toStringEsMultiParameter(params.index);
        span.data.elasticsearch.type = toStringEsMultiParameter(params.type);
        span.data.elasticsearch.stats = toStringEsMultiParameter(params.stats);
        span.data.elasticsearch.id = params.id;
        if (action.indexOf('search') === 0) {
          span.data.elasticsearch.query = tracingUtil.shortenDatabaseStatement(JSON.stringify(params));
        }
      }

      if (originalArgs.length === 2) {
        originalArgs[1] = cls.ns.bind(function(error, response) {
          if (error) {
            onError(span, error);
          } else {
            onSuccess(span, response);
          }
          return cb.apply(this, arguments);
        });

        return originalFunction.apply(ctx, originalArgs);
      } else {
        try {
          return originalFunction.apply(ctx, originalArgs).then(onSuccess.bind(null, span), function(error) {
            onError(span, error);
            throw error;
          });
        } catch (e) {
          // Immediately cleanup on synchronous errors.
          throw e;
        }
      }
    });
  };
}

function onSuccess(span, response) {
  if (response.hits != null && response.hits.total != null) {
    if (typeof response.hits.total === 'number') {
      span.data.elasticsearch.hits = response.hits.total;
    } else if (typeof response.hits.total.value === 'number') {
      span.data.elasticsearch.hits = response.hits.total.value;
    }
  } else if (response.responses != null && Array.isArray(response.responses)) {
    span.data.elasticsearch.hits = response.responses.reduce(function(hits, res) {
      if (res.hits && typeof res.hits.total === 'number') {
        return hits + res.hits.total;
      } else if (res.hits && res.hits.total && typeof res.hits.total.value === 'number') {
        return hits + res.hits.total.value;
      }
      return hits;
    }, 0);
  }
  span.d = Date.now() - span.ts;
  span.transmit();
  return response;
}

function onError(span, error) {
  span.d = Date.now() - span.ts;
  span.ec = 1;
  if (error) {
    span.data.elasticsearch.error = tracingUtil.getErrorDetails(error);
  }
  span.transmit();
}

function toStringEsMultiParameter(param) {
  if (param == null) {
    return undefined;
  }

  if (typeof param === 'string') {
    if (param === '') {
      return '_all';
    }
    return param;
  } else if (Array.isArray(param)) {
    return param.join(',');
  }

  return JSON.stringify(param);
}

function getSpanDataFromMget1(span, docs) {
  var indices = [];
  var types = [];
  var stats = [];
  var ids = [];
  for (var i = 0; i < docs.length; i++) {
    collectParamFrom(docs[i], '_index', indices);
    collectParamFrom(docs[i], '_type', types);
    collectParamFrom(docs[i], '_stats', stats);
    collectParamFrom(docs[i], '_id', ids);
  }
  span.data.elasticsearch.index = indices.length > 0 ? indices.join(',') : undefined;
  span.data.elasticsearch.type = types.length > 0 ? types.join(',') : undefined;
  span.data.elasticsearch.stats = stats.length > 0 ? stats.join(',') : undefined;
  span.data.elasticsearch.id = ids.length > 0 ? ids.join(',') : undefined;
}

function getSpanDataFromMget2(span, params) {
  span.data.elasticsearch.index = params.index ? toStringEsMultiParameter(params.index) : undefined;
  span.data.elasticsearch.type = params.index ? toStringEsMultiParameter(params.type) : undefined;
  span.data.elasticsearch.stats = params.index ? toStringEsMultiParameter(params.stats) : undefined;
  span.data.elasticsearch.id = params.body.ids.length > 0 ? params.body.ids.join(',') : undefined;
}

function getSpanDataFromMsearch(span, body) {
  var indices = [];
  var types = [];
  var stats = [];
  var query = [];
  for (var i = 0; i < body.length; i++) {
    collectParamFrom(body[i], 'index', indices);
    collectParamFrom(body[i], 'type', types);
    collectParamFrom(body[i], 'stats', stats);
    collectParamFrom(body[i], 'query', query);
  }
  span.data.elasticsearch.index = indices.length > 0 ? indices.join(',') : undefined;
  span.data.elasticsearch.type = types.length > 0 ? types.join(',') : undefined;
  span.data.elasticsearch.stats = stats.length > 0 ? stats.join(',') : undefined;
  span.data.elasticsearch.query = query.length > 0 ? tracingUtil.shortenDatabaseStatement(query.join(',')) : undefined;
}

function collectParamFrom(bodyItem, key, accumulator) {
  if (bodyItem && bodyItem[key]) {
    var value = toStringEsMultiParameter(bodyItem[key]);
    if (value != null && accumulator.indexOf(value) < 0) {
      accumulator.push(value);
    }
  }
}

exports.activate = function() {
  isActive = true;
};

exports.deactivate = function() {
  isActive = false;
};
