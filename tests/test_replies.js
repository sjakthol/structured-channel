describe("StructuredChannel", function() {
  describe("reply handling from Window objects", function() {
    it("should send sync replies properly", function() {
      return initializeChannelToFrame().then(function(chnl) {
        return chnl.send("ping", "foo");
      }).then(function(reply) {
        expect(reply).to.equal("foo");
      });
    });

    it("should send async replies properly", function() {
      return initializeChannelToFrame().then(function(chnl) {
        return chnl.send("async-ping", 2);
      }).then(function(reply) {
        expect(reply).to.equal(2);
      });
    });

    it("should send sync errors properly", function() {
      return initializeChannelToFrame().then(function(chnl) {
        return expectRejection(chnl.send("throw", "rorre"), /rorre/);
      });
    });

    it("should send async errors properly", function() {
      return initializeChannelToFrame().then(function(chnl) {
        return expectRejection(chnl.send("async-error", "rorre"), /rorre/);
      });
    });
  });

  describe("reply handling from Workers", function() {
    it("should send sync replies properly", function() {
      return initializeChannelToWorker().then(function(chnl) {
        return chnl.send("ping", "foo");
      }).then(function(reply) {
        expect(reply).to.equal("foo");
      });
    });

    it("should send async replies properly", function() {
      return initializeChannelToWorker().then(function(chnl) {
        return chnl.send("async-ping", 2);
      }).then(function(reply) {
        expect(reply).to.equal(2);
      });
    });

    it("should send sync errors properly", function() {
      return initializeChannelToWorker().then(function(chnl) {
        return expectRejection(chnl.send("throw", "rorre"), /rorre/);
      });
    });

    it("should send async errors properly", function() {
      return initializeChannelToWorker().then(function(chnl) {
        return expectRejection(chnl.send("async-error", "rorre"), /rorre/);
      });
    });
  });
});