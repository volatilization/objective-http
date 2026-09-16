const request = require('../request');

module.exports = Object.freeze({
    ...request,

    origin: request,
    query: undefined,
    headers: undefined,
    body: undefined,

    recive() {
        return new Promise((resolve, reject) => {
            try {
                this.stream.on('error', (e) => {
                    reject(
                        new Error('Server request error', {
                            cause: { error: e, code: 'REQUEST_ERROR' },
                        }),
                    );
                });

                let chunks = [];
                this.stream.on('data', (chunk) => chunks.push(chunk));
                this.stream.on('end', () => {
                    resolve({
                        ...this,
                        query: new URL(
                            `http://${process.env.HOST ?? 'localhost'}${this.stream.url}`,
                        ).searchParams,
                        headers: new Headers(this.stream.headers),
                        body: Buffer.concat(chunks),
                    });
                });
            } catch (e) {
                reject(
                    new Error('Server request error', {
                        cause: { error: e, code: 'REQUEST_ERROR' },
                    }),
                );
            }
        });
    },
});
