module.exports = Object.freeze({
    getStream() {
        return this.stream;
    },

    getQuery() {
        return this.query;
    },

    getHeaders() {
        return this.headers;
    },

    getRoute() {
        return {
            method: this.getStream().method,
            path: new URL(`http://localhost${this.getStream().url}`).pathname,
        };
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

                this.getStream().on('end', () => {
                    resolve({
                        ...this,
                        query: new URL(
                            `http://localhost${this.getStream().url}`,
                        ).searchParams,
                        headers: new Headers(this.getStream().headers),
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
