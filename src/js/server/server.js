module.exports = Object.freeze({
    getHttp() {
        return this.http;
    },

    getEndpoint() {
        return this.endpoint;
    },

    getErrorResponse() {
        return this.errorResponse;
    },

    getOptions() {
        return this.options;
    },

    start() {
        return new Promise((resolve, reject) => {
            try {
                const instance = this.getHttp().createServer(
                    async (requestStream, responseStream) => {
                        try {
                            await {
                                ...this.getEndpoint(),
                                request: {
                                    ...this.getEndpoint().getRequest(),
                                    stream: requestStream,
                                },
                                response: {
                                    ...this.getEndpoint().getResponse(),
                                    stream: responseStream,
                                },
                            }.handle();
                        } catch (e) {
                            ({
                                ...this.getErrorResponse(),
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

    getOrigin(proxy = this) {
        return {
            ...this.origin?.getOrigin(proxy),
            ...(this.origin ?? this),
            http: proxy.http,
            endpoint: proxy.endpoint,
            errorResponse: proxy.errorResponse,
            options: proxy.options,
        };
    },
});
