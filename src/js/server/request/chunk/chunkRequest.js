const request = require('../request');

module.exports = Object.freeze({
    ...request,

    getBody() {
        return this.body;
    },

    recive() {
        return new Promise((resolve, reject) => {
            try {
                this.getStream().on('error', (e) => {
                    reject(
                        new Error('Server request error', {
                            cause: { error: e, code: 'REQUEST_ERROR' },
                        }),
                    );
                });

                let chunks = [];
                this.getStream().on('data', (chunk) => chunks.push(chunk));
                this.getStream().on('end', () => {
                    resolve({
                        ...this,
                        query: new URL(
                            `http://localhost${this.getStream().url}`,
                        ).searchParams,
                        headers: new Headers(this.getStream().headers),
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
