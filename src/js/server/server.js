module.exports = Object.freeze({
    endpoints: undefined,
    errorResponse: undefined,
    options: undefined,
    http: undefined,
    instance: undefined,

    start() {
        return new Promise((resolve, reject) => {
            try {
                const instance = this.http.createServer(
                    async (requestStream, responseStream) => {
                        try {
                            await {
                                ...this.endpoints,
                                request: {
                                    ...this.endpoints.request,
                                    stream: requestStream,
                                },
                                response: {
                                    ...this.endpoints.response,
                                    stream: responseStream,
                                },
                            }.handle();
                        } catch (e) {
                            ({
                                ...this.errorResponse,
                                stream: responseStream,
                                error: e,
                            }).send();
                        }
                    },
                );

                instance.listen(this.options, () =>
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
