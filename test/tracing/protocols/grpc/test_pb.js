/* eslint-disable */

/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.instana.node.grpc.test.TestReply', null, global);
goog.exportSymbol('proto.instana.node.grpc.test.TestRequest', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.instana.node.grpc.test.TestRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.instana.node.grpc.test.TestRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.instana.node.grpc.test.TestRequest.displayName = 'proto.instana.node.grpc.test.TestRequest';
}

if (jspb.Message.GENERATE_TO_OBJECT) {
  /**
   * Creates an object representation of this proto suitable for use in Soy templates.
   * Field names that are reserved in JavaScript and will be renamed to pb_name.
   * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
   * For the list of reserved names please see:
   *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
   * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
   *     for transitional soy proto support: http://goto/soy-param-migration
   * @return {!Object}
   */
  proto.instana.node.grpc.test.TestRequest.prototype.toObject = function(opt_includeInstance) {
    return proto.instana.node.grpc.test.TestRequest.toObject(opt_includeInstance, this);
  };

  /**
   * Static version of the {@see toObject} method.
   * @param {boolean|undefined} includeInstance Whether to include the JSPB
   *     instance for transitional soy proto support:
   *     http://goto/soy-param-migration
   * @param {!proto.instana.node.grpc.test.TestRequest} msg The msg instance to transform.
   * @return {!Object}
   * @suppress {unusedLocalVariables} f is only used for nested messages
   */
  proto.instana.node.grpc.test.TestRequest.toObject = function(includeInstance, msg) {
    var f,
      obj = {
        parameter: jspb.Message.getFieldWithDefault(msg, 1, '')
      };

    if (includeInstance) {
      obj.$jspbMessageInstance = msg;
    }
    return obj;
  };
}

/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.instana.node.grpc.test.TestRequest}
 */
proto.instana.node.grpc.test.TestRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.instana.node.grpc.test.TestRequest();
  return proto.instana.node.grpc.test.TestRequest.deserializeBinaryFromReader(msg, reader);
};

/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.instana.node.grpc.test.TestRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.instana.node.grpc.test.TestRequest}
 */
proto.instana.node.grpc.test.TestRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
      case 1:
        var value = /** @type {string} */ (reader.readString());
        msg.setParameter(value);
        break;
      default:
        reader.skipField();
        break;
    }
  }
  return msg;
};

/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.instana.node.grpc.test.TestRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.instana.node.grpc.test.TestRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};

/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.instana.node.grpc.test.TestRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.instana.node.grpc.test.TestRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getParameter();
  if (f.length > 0) {
    writer.writeString(1, f);
  }
};

/**
 * optional string parameter = 1;
 * @return {string}
 */
proto.instana.node.grpc.test.TestRequest.prototype.getParameter = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ''));
};

/** @param {string} value */
proto.instana.node.grpc.test.TestRequest.prototype.setParameter = function(value) {
  jspb.Message.setField(this, 1, value);
};

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.instana.node.grpc.test.TestReply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.instana.node.grpc.test.TestReply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.instana.node.grpc.test.TestReply.displayName = 'proto.instana.node.grpc.test.TestReply';
}

if (jspb.Message.GENERATE_TO_OBJECT) {
  /**
   * Creates an object representation of this proto suitable for use in Soy templates.
   * Field names that are reserved in JavaScript and will be renamed to pb_name.
   * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
   * For the list of reserved names please see:
   *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
   * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
   *     for transitional soy proto support: http://goto/soy-param-migration
   * @return {!Object}
   */
  proto.instana.node.grpc.test.TestReply.prototype.toObject = function(opt_includeInstance) {
    return proto.instana.node.grpc.test.TestReply.toObject(opt_includeInstance, this);
  };

  /**
   * Static version of the {@see toObject} method.
   * @param {boolean|undefined} includeInstance Whether to include the JSPB
   *     instance for transitional soy proto support:
   *     http://goto/soy-param-migration
   * @param {!proto.instana.node.grpc.test.TestReply} msg The msg instance to transform.
   * @return {!Object}
   * @suppress {unusedLocalVariables} f is only used for nested messages
   */
  proto.instana.node.grpc.test.TestReply.toObject = function(includeInstance, msg) {
    var f,
      obj = {
        message: jspb.Message.getFieldWithDefault(msg, 1, '')
      };

    if (includeInstance) {
      obj.$jspbMessageInstance = msg;
    }
    return obj;
  };
}

/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.instana.node.grpc.test.TestReply}
 */
proto.instana.node.grpc.test.TestReply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.instana.node.grpc.test.TestReply();
  return proto.instana.node.grpc.test.TestReply.deserializeBinaryFromReader(msg, reader);
};

/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.instana.node.grpc.test.TestReply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.instana.node.grpc.test.TestReply}
 */
proto.instana.node.grpc.test.TestReply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
      case 1:
        var value = /** @type {string} */ (reader.readString());
        msg.setMessage(value);
        break;
      default:
        reader.skipField();
        break;
    }
  }
  return msg;
};

/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.instana.node.grpc.test.TestReply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.instana.node.grpc.test.TestReply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};

/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.instana.node.grpc.test.TestReply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.instana.node.grpc.test.TestReply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMessage();
  if (f.length > 0) {
    writer.writeString(1, f);
  }
};

/**
 * optional string message = 1;
 * @return {string}
 */
proto.instana.node.grpc.test.TestReply.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ''));
};

/** @param {string} value */
proto.instana.node.grpc.test.TestReply.prototype.setMessage = function(value) {
  jspb.Message.setField(this, 1, value);
};

goog.object.extend(exports, proto.instana.node.grpc.test);