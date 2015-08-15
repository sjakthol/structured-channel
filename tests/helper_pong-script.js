if (typeof self.importScripts === "function") {
  // In a Worker. Import the script.
  self.importScripts("/base/dist/structured-channel.js");
}

StructuredChannel.waitForConnection("localhost", this).then(function(chnl) {
  chnl.on("ping", function(payload) {
    return payload;
  });

  chnl.on("async-ping", function(payload) {
    return new Promise(function(resolve) {
      setTimeout(function() { resolve(payload) }, 10);
    });
  });

  chnl.on("async-error", function(payload) {
    return new Promise(function(_, reject) {
      setTimeout(function() { reject(payload) }, 10);
    });
  });

  chnl.on("throw", function(payload) {
    throw new Error(payload);
  });
});
