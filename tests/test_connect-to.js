describe("StructuredChannel.connectTo()", function() {

  function ensureConnected(channel) {
    return channel.send("ping", "abc").then(function(reply) {
      expect(reply).to.equal("abc");
    });
  }

  /** Window tests **/
  it("should connect to a Window with a target only", function() {
    return initializeFrame().then(function(target) {
      return StructuredChannel.connectTo(target);
    }).then(ensureConnected);
  });

  it("should connect to a Window with target + targetOrigin", function() {
    return initializeFrame().then(function(target) {
      return StructuredChannel.connectTo(target, target.document.location.origin);
    }).then(ensureConnected);
  });

  it("should connect to a same-origin Window with targetOrigin *", function() {
    return initializeFrame().then(function(target) {
      return StructuredChannel.connectTo(target, "*");
    }).then(ensureConnected);
  });

  it("should connect to a Window with global as second argument", function() {
    return initializeFrame().then(function(target) {
      return StructuredChannel.connectTo(target, window);
    }).then(ensureConnected);
  });

  it("should connect to a Window with targetOrigin + global", function() {
    return StructuredChannel.connectTo(initializeWorker(), "*", window)
      .then(ensureConnected);
  });

  /** Worker tests **/
  it("should connect to a Worker with a target only", function() {
    return StructuredChannel.connectTo(initializeWorker())
      .then(ensureConnected);
  });

  it("should connect to a Worker with target + targetOrigin", function() {
    return StructuredChannel.connectTo(initializeWorker(), "foobar")
      .then(ensureConnected);
  });

  it("should connect to a Worker with global as second argument", function() {
    return StructuredChannel.connectTo(initializeWorker(), window)
      .then(ensureConnected);
  });

  it("should connect to a Worker with targetOrigin + global", function() {
    return StructuredChannel.connectTo(initializeWorker(), "obm", window)
      .then(ensureConnected);
  });

  it("should reject if target not defined", function() {
    return expectRejection(StructuredChannel.connectTo());
  });

  it("should reject if targetOrigin does not match", function() {
    return initializeFrame().then(function(target) {
      return expectRejection(StructuredChannel.connectTo(target, "http://no.com:123"));
    });
  });
});