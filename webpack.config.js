module.exports = {
  entry: "./lib/structured-channel.js",
  output: {
    path: __dirname + "/dist",
    filename: "structured-channel.js",
    libraryTarget: "var",
    library: "StructuredChannel"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  }
};
