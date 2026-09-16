const response = require('../response');

module.exports = Object.freeze({
    ...response,

    origin: response,
    body: undefined,

    recive() {
        return new Promise((resolve, reject) => {
            try {
                this.stream.on('error', (e) => {
                    reject(
                        new Error('Client response error', {
                            cause: { error: e, code: 'RESPONSE_ERROR' },
                        }),
                    );
                });

                var chunks = [];
                this.stream.on('data', (chunk) => chunks.push(chunk));
                this.stream.on('end', () => {
                    resolve({
                        ...this,
                        status: this.stream.statusCode,
                        headers: new Headers(this.stream.headers),
                        body: Buffer.concat(chunks),
                    });
                });
            } catch (e) {
                reject(
                    new Error('Client reponse error', {
                        cause: { error: e, code: 'RESPONSE_ERROR' },
                    }),
                );
            }
        });
    },
});
