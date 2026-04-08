import path from 'node:path';
import { fileURLToPath } from 'node:url';
import CopyPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    entry: path.resolve(__dirname, 'src', 'js', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'objective-http',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this',
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                path.resolve(__dirname, 'package.json'),
                path.resolve(__dirname, 'README.md'),
                path.resolve(__dirname, 'LICENSE'),
            ],
        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                },
            }),
        ],
    },
    mode: 'production',
    target: 'node',
};
