'use strict';

var blacklist = [];

module.exports = exports = function applyCompressionRoot(prev, next) {
  var result = applyCompression([], prev, next);

  // the root object needs to be at least an empty object.
  if (result === undefined) {
    return {};
  }
  return result;
};

function applyCompression(path, prev, next) {
  if (isBlacklisted(path)) {
    return next;
  }
  if (prev === next) {
    return undefined;
  }

  var pType = typeof prev;
  var nType = typeof next;

  if (pType !== nType) {
    return next;
  } else if (Array.isArray(next)) {
    return applyCompressionToArray(prev, next);
  } else if (nType === 'object') {
    return applyCompressionToObject(path, prev, next);
  } else if (prev !== next) {
    return next;
  }

  return undefined;
}

function applyCompressionToObject(path, prev, next) {
  var result = {};
  var addedProps = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (var nKey in next) {
    // eslint-disable-next-line no-prototype-builtins
    if (next.hasOwnProperty(nKey)) {
      var nValue = next[nKey];
      var pValue = prev[nKey];

      var compressed = applyCompression(path.concat(nKey), pValue, nValue);
      if (compressed !== undefined) {
        result[nKey] = compressed;
        addedProps++;
      }
    }
  }

  if (addedProps > 0) {
    return result;
  }

  return undefined;
}

function applyCompressionToArray(prev, next) {
  if (next.length !== prev.length) {
    return next;
  }

  var hasChanges = false;

  for (var i = 0, len = next.length; i < len && !hasChanges; i++) {
    hasChanges = prev[i] !== next[i];
  }

  if (hasChanges) {
    return next;
  }
  return undefined;
}

exports.setBlacklist = function setBlacklist(_blacklist) {
  blacklist = _blacklist;
};

exports.clearBlacklist = function clearBlacklist() {
  blacklist = [];
};

function isBlacklisted(path) {
  // Compare the given path to all blacklist entries.
  // eslint-disable-next-line no-restricted-syntax
  outer: for (var i = 0; i < blacklist.length; i++) {
    if (blacklist[i].length !== path.length) {
      // The blacklist entry and then given path have different lengths, this cannot be a match. Continue with next
      // blackist entry.
      break;
    }
    for (var j = 0; j < blacklist[i].length; j++) {
      if (blacklist[i][j] !== path[j]) {
        // We found a path segment that is differnt for this blacklist entry and then given path, this cannot be a
        // match. Continue with next blackist entry.
        // eslint-disable-next-line no-continue
        continue outer;
      }
    }
    // This blacklist entry and the given path have the same number of segments and all segments are identical, so this
    // is a match, that is, this path has been blacklisted for compression.
    return true;
  }
  return false;
}
