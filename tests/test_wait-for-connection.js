describe("StructuredChannel.waitForConnection()", function() {
  it("should return a working channel", function() {
    return createChannelPair().then(function(channels) {
      expect(channels.child).to.be.defined;
      expect(channels.child).to.be.instanceof(StructuredChannel);
    });
  });

  it("should work with implicit target", function() {
    StructuredChannel.connectTo(window);
    return StructuredChannel.waitForConnection();
  });

  it("should work with origin = *", function() {
    StructuredChannel.connectTo(window);
    return StructuredChannel.waitForConnection(window, "*");
  });

  it("should send an error when origin does not match", function() {
    StructuredChannel.waitForConnection(window, "http://abc.com:1234");
    return expectRejection(StructuredChannel.connectTo(window));
  });
});