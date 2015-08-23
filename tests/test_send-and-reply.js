describe("StructuredChannel.send()", function() {
  var data = { a: 1, b: "test", c: [1, 2, 3], d: { e: null }};

  it("should resolve once the remote replies", genericTest(function(channel) {
    return channel.send("ping", data).then(function(reply) {
      expect(reply).to.deep.equal(data);
    });
  }));

  it("should resolve once remote sends an async reply",
    genericTest(function(channel) {
      return channel.send("async-ping", data).then(function(reply) {
        expect(reply).to.deep.equal(data);
      });
    })
  );

  it("should reject if remote handlers rejects", genericTest(function(channel) {
    return expectRejection(channel.send("async-error", data));
  }));

  it("should reject if remote handlers throws synchronously",
    genericTest(function(channel) {
      return expectRejection(channel.send("throw", data));
    })
  );

  it("should reject if there is no handler for the message",
    genericTest(function(channel) {
      return expectRejection(channel.send("abc"));
    })
  );

  it("should reject if the payload cannot be cloned",
    genericTest(function(channel) {
      return expectRejection(channel.send("abc", { a: function() {} }));
    })
  );

  it("should map replies to correct requests", genericTest(function(channel) {
    // Async ping is sent first, the reply should come after the sync one.
    var op1 = channel.send("async-ping", data).then(function(reply) {
      expect(reply).to.deep.equal(data);
    });

    var op2 = channel.send("ping", "sync-ping").then(function(reply) {
      expect(reply).to.equal("sync-ping");
    });

    return Promise.all([op1, op2]);
  }));

  it("should map replies to correct requests of same type",
    genericTest(function(channel) {
      // Async ping is sent first, the reply should come after the sync one.
      var op1 = channel.send("ping", data).then(function(reply) {
        expect(reply).to.deep.equal(data);
      });

      var op2 = channel.send("ping", "ping").then(function(reply) {
        expect(reply).to.equal("ping");
      });

      return Promise.all([op1, op2]);
    })
  );
});
