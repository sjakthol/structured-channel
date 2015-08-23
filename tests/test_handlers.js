describe("StructuredChannel registration handler", function() {
  it("should register a handler when on() is called", function() {
    return createChannelPair().then(function(chnls) {
      chnls.child.on("test", function() {
        return "hi";
      });

      return chnls.parent.send("test").then(function(reply) {
        expect(reply).to.equal("hi");
      });
    });
  });

  it("should throw if the event has a handler already", function() {
    return createChannelPair().then(function(chnls) {
      // Register the handler.
      chnls.child.on("test", function() {});

      // Try to do it again.
      expect(function() {
        chnls.child.on("test", function() {});
      }).to.throw(Error);
    });
  });

  it("should unregister a handler correctly", function() {
    return createChannelPair().then(function(chnls) {
      // Register it.
      chnls.child.on("test", function() {
        return "hi";
      });

      // Unregister it.
      chnls.child.off("test");

      // Try to call it
      return expectRejection(chnls.parent.send("test"));
    });
  });
});
