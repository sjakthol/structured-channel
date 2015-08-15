describe("StructuredChannel", function() {
  it("should be exported to the global scope", function() {
    expect(StructuredChannel).to.be.defined;
    expect(StructuredChannel).to.be.function;
    expect(StructuredChannel.connectTo).to.be.function;
    expect(StructuredChannel.waitForConnection).to.be.function;
  });

  describe("connectTo()", function() {
    it("should connect to a same-origin frame", function() {
      return initializeChannelToFrame();
    });

    it("should connect to a worker", function() {
      return initializeChannelToWorker();
    });
  });
});
