import path from 'node:path';
import { fileURLToPath } from 'node:url';
import CopyPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const __dirname = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
);

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
                {
                    from: path.resolve(__dirname, 'package.json'),
                    transform(content) {
                        return Buffer.from(
                            JSON.stringify(
                                JSON.parse(content.toString('utf-8')),
                                (key, value) => {
                                    switch (key) {
                                        case 'main':
                                            return 'index.js';
                                        case 'scripts':
                                            return undefined;
                                        case 'devDependencies':
                                            return undefined;
                                        case 'browserslist':
                                            return undefined;
                                        default:
                                            return value;
                                    }
                                },
                                '\t',
                            ),
                        );
                    },
                },
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
