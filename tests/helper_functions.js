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
    var chnl = StructuredChannel.connectTo(win, targetOrigin, global);
    return once(chnl, "ready").then(function() {
      return chnl;
    });
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
  var chnl = StructuredChannel.connectTo(worker, targetOrigin, global);
  return once(chnl, "ready").then(function() {
    return chnl;
  });
}

/**
 * Expects the given promise to reject.
 *
 * @param {Promise} promise - The promise to assert on.
 *
 * @return {Promise} A Promise that is fulfilled once the given promise settles.
 */
function expectRejection(promise) {
  return promise.then(function() {
    expect(true, "Unexpected success!").to.be.false;
  }, function() {
    expect(true, "Rejected, as expected!").to.be.true;
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
