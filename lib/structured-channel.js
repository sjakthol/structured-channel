"use strict";

const REPLY_TYPE = "X-StructuredChannel-internal-reply";
const HELLO_TYPE = "X-StructuredChannel-internal-hello";
const ANY_ORIGIN = "*";

function StructuredChannel(port, origin) {
  this._handleMessage = this._handleMessage.bind(this);
  this._handlers = new Map();
  this._pendingMessages = new Map();
  this._messageID = 0;
  this._doDebug = false;

  this.port = port;
  this.port.addEventListener("message", this._handleMessage);
  this.port.start();

  this.origin = origin;
}

StructuredChannel.prototype = {
  /**
   * Prints a message to the console if this._doDebug is true.
   * @private
   */
  _debug: function(...args) {
    if (this._doDebug) {
      console.log("DEBUG:", ...args);
    }
  },

  /**
   * Prints a warning message to the console.
   * @private
   */
  _warn: function(...args) {
    console.log("WARNING:", [...args].map(JSON.stringify).join(" "));
  },

  /**
   * Adds a handler for given message type.
   *
   * @param {String} type - The type of the message to handle.
   * @param {Function} handler - The handler function.
   */
  on: function(eventType, handler) {
    if (this._handlers.has(eventType)) {
      throw new Error("Multiple handlers registered for " + eventType);
    }

    this._handlers.set(eventType, handler);
  },

  /**
   * Removes the handler for the message of given type.
   *
   * @param {String} type - The type of the message for which the handler is
   * to be removed.
   */
  off: function(eventType) {
    if (!this._handlers.has(eventType)) {
      this._warn("WARNING: Tried to unregister handler for", eventType,
        "that has no handler.");
      return;
    }

    this._handlers.delete(eventType);
  },

  /**
   * Sends a message to the other side of the channel.
   *
   * @param {String} type - The type of the message.
   * @param {Object} payload - The payload for the message. The value must
   * support structured cloning.
   * @param {Array} transfer - An array of values that are transferred to the
   * target context.
   *
   * @return A Promise that is resolved once the receiver has handled the
   * message. The resolution value will be the object the handler method
   * returned. If the message handler fails, the promise is rejected.
   */
  send: function(type, payload) {
    let data = {
      id: this._messageID++,
      payload: payload,
      type,
    };

    return new Promise((resolve, reject) => {
      this._pendingMessages.set(data.id, { resolve, reject });
      this.port.postMessage(data);
    });
  },

  /**
   * Handles the messages sent to this port.
   *
   * @private
   */
  _handleMessage: function(event) {
    let { data } = event;
    this._debug("Got a message with data:", data);

    let { id, type } = data;
    if (id === undefined || !type || (typeof type !== "string") || !type.trim()) {
      this._warn("Got an invalid message:", data);
      return;
    }

    if (type === REPLY_TYPE) {
      // This is a reply to a previous message.
      return this._handleReply(data);
    } else {
      // This is a new message for the client to handle.
      return this._handleNewMessage(data);
    }
  },

  /**
   * Handles replies to previously sent message.
   *
   * @private
   */
  _handleReply: function(data) {
    let { id } = data;
    if (!this._pendingMessages.has(id)) {
      this._debug("Ignoring an unexpected reply.");
      return;
    }

    let { resolve, reject } = this._pendingMessages.get(id);

    if (data.error) {
      this._debug("Received an error reply for message", id);
      this._debug("Error was", data.error);
      reject(data.error);
    } else {
      this._debug("Received a success reply for message", id);
      this._debug("Result was", data.result);
      resolve(data.result);
    }

    this._pendingMessages.delete(id);
    return;
  },

  /**
   * Handles a new message.
   *
   * @private
   */
  _handleNewMessage: function(data) {
    let { id, type, payload } = data;
    let handler = this._handlers.get(type);
    let handlerResult = null;
    try {
      if (handler) {
        handlerResult = Promise.resolve(handler(payload));
      } else {
        this._warn("Received a message of type", type, "that has no handler.");
        handlerResult = Promise.reject("Unhandled message " + type);
      }
    } catch (e) {
      this._warn("Handler function failed:", e);
      handlerResult = Promise.reject(e.message || e.name || "Unknown error");
    }

    handlerResult.then(result => {
      this.port.postMessage({ type: REPLY_TYPE, result, id });
    }, err => {
      this.port.postMessage({ type: REPLY_TYPE, error: err || "Unknown error", id });
    }).catch(_ => {
      // The return value could not be transferred or something else is horribly
      // broken.
      this.port.postMessage({ type: REPLY_TYPE, error: "Reply failed", id });
    });
  },
};

/**
 * Opens a StructuredChannel to the given target. The target must load this
 * script and call `StructuredChannel.waitForConnection()`.
 *
 * @param {Window|Worker} target - The target window or a worker to connect to.
 * @param {String} [targetOrigin=*] - If the target is a Window, this is the
 * `targetOrigin` for [Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).
 * __Failing to provide this parameter might have security implications as the
 * channel could be opened to a malicious target.__ If the target is a Worker,
 * this parameter is ignored.
 * @param {Object} [global] - An optional global object that can be used to get
 * a reference to the MessageChannel constructor.
 *
 * @return {Promise} A Promise that is fulfilled with a `StructuredChannel`
 * instance once the connection has been established. The promise is rejected on
 * error.
 *
 * @throws {TypeError} TypeError if @param target is undefined.
 *
 */
StructuredChannel.connectTo = function(target, targetOrigin, global) {
  if (!target) {
    return Promise.reject("Target must be defined.");
  }

  if (targetOrigin && typeof targetOrigin.MessageChannel === "function") {
    // Second param is the global object, targetOrigin is undefined.
    global = targetOrigin;
    targetOrigin = undefined;
  }

  // Create the channel.
  let channel = global ? new global.MessageChannel() : new MessageChannel();
  let origin = targetOrigin ? targetOrigin : ANY_ORIGIN;

  // Initiate the connection.
  if ("document" in target) {
    // target looks like a Window. Check the origin and report a failure to the
    // user. postMessage just silently discards the message it if the origins
    // don't match.
    if (targetOrigin && targetOrigin !== ANY_ORIGIN &&
        targetOrigin !== target.document.location.origin)
    {
      return Promise.reject("The origins don't match.");
    }

    target.postMessage(HELLO_TYPE, origin, [channel.port2]);
  } else {
    // This is a worker.
    target.postMessage(HELLO_TYPE, [channel.port2]);
  }

  return new Promise(function(resolve, reject) {
    let schnl = new StructuredChannel(channel.port1, origin);
    let ready = () => {
      schnl.off("ready", ready);
      schnl.off("error", error);
      resolve(schnl);
    };

    let error = reason => {
      schnl.off("ready", success);
      schnl.off("error", error);
      reject(reason);
    };

    schnl.on("ready", ready);
    schnl.on("error", error);
  });
};

/**
 * Waits for a connection request from `StructuredChannel.connectTo()` to arrive
 * as a message event to the given target.
 *
 * @param {String} [origin] - The origin from which the connection attemp should
 * come from. If undefined, connection attempts and messages from all origins
 * are allowed.
 * @param {Window|Worker} [target] - The target window.
 *
 * @return {Promise} that is resolved with a `StructuredChannel` instace once
 * the connection request is received.
 */
StructuredChannel.waitForConnection = function(origin, target) {
  return new Promise((resolve, reject) => {
    var handler = ev => {
      if (ev.data === HELLO_TYPE) {
        target.onmessage = null;
        let channel = new StructuredChannel(ev.ports[0]);
        channel.send("ready");
        resolve(channel);
      }
    };

    target.onmessage = handler;
  });
};

module.exports = StructuredChannel;
