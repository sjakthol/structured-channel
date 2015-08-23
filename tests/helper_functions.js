var PONG_FRAME_URL = "/base/tests/helper_pong-frame.html";
var PONG_SCRIPT_URL = "/base/tests/helper_pong-script.js";

/**
 * Initializes a new iframe with the given URL.
 *
 * @param {String} [url=/base/tests/helper_pong-frame.html] - The URL to load.
 * @return {Promise} A promise that is fulfilled with the content window once
 * the frame has loaded.
 */
function initializeFrame(url) {
  var frame = document.createElement("iframe");
  var res = new Promise(function(resolve) {
    frame.addEventListener("load", function h() {
      frame.removeEventListener("load", h);
      resolve(frame.contentWindow);
    });
  });
  frame.style.display = "none";
  frame.src = url || PONG_FRAME_URL;
  document.body.appendChild(frame);
  return res;
}

/**
 * Creates a new Worker.
 *
 * @param {String} [url=/base/tests/helper_pong-script.js] - The URL to load.
 * @return {Worker}
 */
function initializeWorker(url) {
  return new Worker(url || PONG_SCRIPT_URL);
}

/**
 * Creates a new iframe and makes a StructuredChannel to the new frame.
 *
 * @param {String} [url=/base/tests/helper_pong-frame.html] - The URL to load.
 * @param {String} targetOrigin - See StructuredChannel.connectTo().
 * @param {Object} global - See StructuredChannel.connectTo().
 * @return {Promise} A promise that is fulfilled with the channel once it is
 * ready.
 */
function initializeChannelToFrame(url, targetOrigin, global) {
  return initializeFrame(url).then(function(win) {
    return StructuredChannel.connectTo(win, targetOrigin, global);
  });
}

/**
 * Creates a new iframe or a worker and makes a StructuredChannel between the
 * created target and this frame.
 *
 * @param {String} [url=/base/tests/helper_pong-script.js] - The URL to load.
 * @param {String} targetOrigin - See StructuredChannel.connectTo().
 * @param {Object} global - See StructuredChannel.connectTo().
 * @return {Promise} A promise that is fulfilled with the channel once it is
 * ready.
 */
function initializeChannelToWorker(url, targetOrigin, global) {
  var worker = initializeWorker(url);
  return StructuredChannel.connectTo(worker, targetOrigin, global);
}

/**
 * Creates a channel to a window and runs the given test function body.
 *
 * @param {Function} body - The body of the test. It'll receive the channel as
 * the first argument. The method can return a promise.
 *
 * @return {Function} Test function to be passed to it().
 */
function windowTest(body) {
  return function() {
    return initializeChannelToFrame().then(body);
  };
}

/**
 * Creates a channel to a worker and runs the given test function body.
 *
 * @param {Function} body - The body of the test. It'll receive the channel as
 * the first argument. The method can return a promise.
 *
 * @return {Function} Test function to be passed to it().
 */
function workerTest(body) {
  return function() {
    return initializeChannelToWorker().then(body);
  };
}

/**
 * A function that runs the given test case body against a Window and a Worker.
 *
 * @param {Function} body - The body of the test. It'll receive the channel as
 * the first argument. The method can return a Promise.
 *
 * @return {Function} Test function to be passed to it().
 */
function genericTest(body) {
  return function() {
    return windowTest(body)().then(function() {
      return workerTest(body)();
    });
  };
}

/**
 * Creates a local channel.
 *
 * @return {Promise} A promise that is fulfilled with an object
 * { parent, child } where both values are StructuredChannel objects.
 */
function createChannelPair() {
  var childPromise = StructuredChannel.waitForConnection(window);
  var parentPromise = StructuredChannel.connectTo(window);
  return Promise.all([childPromise, parentPromise]).then(function(channels) {
    return { child: channels[0], parent: channels[1] };
  });
}

/**
 * Expects the given promise to reject.
 *
 * @param {Promise} promise - The promise to assert on.
 * @param {Regexp} rgx - A regular expression the error must match.
 *
 * @return {Promise} A Promise that is fulfilled once the given promise settles.
 */
function expectRejection(promise, rgx) {
  return promise.then(function() {
    expect(true, "Unexpected success!").to.be.false;
  }, function(err) {
    expect(true, "Rejected, as expected!").to.be.true;
    if (rgx) {
      expect(err).to.match(rgx);
    }
  })
}

/**
 * Adds a handler for an event and removes it once the event arrives.
 *
 * @param {StructuredChannel} channel - The channel object.
 * @param {String} event - The name of the event.
 *
 * @return {Promise} A Promise that is fulfilled with the payload once the
 * packet arrives.
 */
function once(channel, event) {
  return new Promise(function(resolve) {
    channel.on(event, function h(payload) {
      channel.off(event, h);
      resolve(payload);
    })
  });
}
