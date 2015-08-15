var webpack = require("webpack");

module.exports = require("./webpack.config.js");
module.exports.output.filename = "structured-channel.min.js";
module.exports.plugins = [
  new webpack.optimize.UglifyJsPlugin({minimize: true})
];
