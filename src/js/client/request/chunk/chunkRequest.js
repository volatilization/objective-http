module.exports = {
    getOptions() {
        const options = this.getOrigin().getOptions();

        return {
            ...options,
            headers: {
                ...options?.headers,
                'content-length': this.getBody()
                    ? Buffer.byteLength(this.getBody())
                    : 0,
            },
        };
    },

    getBody() {
        return this.body;
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

            if (this.getBody()?.length > 0) {
                requestStream.write(this.getBody());
            }

            requestStream.end();
        });
    },

    getOrigin(proxy = this) {
        return {
            ...this.origin?.getOrigin(proxy),
            ...(this.origin ?? this),
            body: proxy.body,
        };
    },
};
