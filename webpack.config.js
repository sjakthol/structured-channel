module.exports = {
  entry: "./index.js",
  output: {
    path: __dirname + "/dist",
    filename: "structured-channel.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  }
};
