describe("StructuredChannel", function() {
  it("should be exported to the global scope", function() {
    expect(StructuredChannel).to.be.defined;
    expect(StructuredChannel).to.be.function;
    expect(StructuredChannel.connectTo).to.be.function;
    expect(StructuredChannel.waitForConnection).to.be.function;
  });
});
