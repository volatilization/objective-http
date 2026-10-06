const response = require('../response');

module.exports = Object.freeze({
    ...response,

    getBody() {
        return this.body;
    },

    recive() {
        return new Promise((resolve, reject) => {
            try {
                this.getStream().on('error', (e) => {
                    reject(
                        new Error('Client response error', {
                            cause: { error: e, code: 'RESPONSE_ERROR' },
                        }),
                    );
                });

                var chunks = [];
                this.getStream().on('data', (chunk) => chunks.push(chunk));
                this.getStream().on('end', () => {
                    resolve({
                        ...this,
                        status: this.getStream().statusCode,
                        headers: new Headers(this.getStream().headers),
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
