const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    entry: {
        popup: path.join(srcDir, 'popup.tsx'),
        content: {
            import: path.join(srcDir, 'content.tsx'),
            chunkLoading: false,
        },
        background: path.join(srcDir, 'background.ts'),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: {
            html2canvas: '@twonull/html2canvas'
        },
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: "../", context: "public" }],
            options: {},
        }),
    ],
};
