const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "static/js/main.js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    // Simple HTML template
    {
      apply: (compiler) => {
        compiler.hooks.emit.tap("GenerateHTML", (compilation) => {
          const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Triage Analytics Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #F4F5F7;
        }
        #root {
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script src="static/js/main.js"></script>
</body>
</html>`;
          compilation.assets["index.html"] = {
            source: () => html,
            size: () => html.length,
          };
        });
      },
    },
  ],
};
