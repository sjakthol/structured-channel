module.exports = {
  entry: "./lib/structured-channel.js",
  output: {
    path: __dirname + "/dist",
    filename: "structured-channel.js",
    library: "StructuredChannel",
    libraryTarget: "umd"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  }
};
