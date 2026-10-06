module.exports = Object.freeze({
    getHttp() {
        return this.http;
    },

    getResponse() {
        return this.response;
    },

    getUrl() {
        return this.url;
    },

    getOptions() {
        return this.options;
    },

    send() {
        return new Promise((resolve, reject) => {
            const responseHandler = (responseStream) => {
                ({
                    ...this.getResponse(),
                    stream: responseStream,
                })
                    .recive()
                    .then(resolve)
                    .catch(reject);
            };

            const requestStream = this.getUrl()
                ? this.getHttp().request(
                      this.getUrl(),
                      this.getOptions(),
                      responseHandler,
                  )
                : this.getHttp().request(this.getOptions(), responseHandler);

            requestStream.on('error', (e) => {
                reject(
                    new Error('Client request error', {
                        cause: { error: e, code: 'REQUEST_ERROR' },
                    }),
                );
            });

            requestStream.end();
        });
    },
});
