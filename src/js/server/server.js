module.exports = Object.freeze({
    getOptions() {
        return this.options;
    },

    start() {
        return new Promise((resolve, reject) => {
            try {
                const instance = this.http.createServer(
                    async (requestStream, responseStream) => {
                        try {
                            await {
                                ...this.endpoints,
                                request: {
                                    ...this.endpoints.getRequest(),
                                    stream: requestStream,
                                },
                                response: {
                                    ...this.endpoints.getResponse(),
                                    stream: responseStream,
                                },
                            }.handle();
                        } catch (e) {
                            console.error(e);
                            ({
                                ...this.errorResponse,
                                stream: responseStream,
                                error: e,
                            }).send();
                        }
                    },
                );

                instance.listen(this.getOptions(), () =>
                    resolve({ ...this, instance }),
                );
            } catch (e) {
                reject(
                    new Error('Server initializing error', {
                        cause: { error: e, code: 'SERVER_INIT_FAIL' },
                    }),
                );
            }
        });
    },

    stop() {
        return new Promise((resolve, reject) => {
            try {
                this.instance.close(() =>
                    resolve({ ...this, instance: undefined }),
                );
            } catch (e) {
                reject(
                    new Error('Server shutdown error', {
                        cause: { error: e, code: 'SERVER_SHUTDOWN_FAIL' },
                    }),
                );
            }
        });
    },
});
