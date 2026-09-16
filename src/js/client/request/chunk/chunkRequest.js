const request = require('../request');

module.exports = Object.freeze({
    ...request,

    origin: request,
    body: undefined,

    send() {
        return new Promise((resolve, reject) => {
            const requestStream = this.http.request(
                {
                    ...this.options,
                    headers: {
                        ...this.options?.headers,
                        'content-length': this.body
                            ? Buffer.byteLength(this.body)
                            : 0,
                    },
                },
                (responseStream) => {
                    ({
                        ...this.response,
                        stream: responseStream,
                    })
                        .recive()
                        .then(resolve)
                        .catch(reject);
                },
            );

            requestStream.on('error', (e) => {
                reject(
                    new Error('Client request error', {
                        cause: { error: e, code: 'REQUEST_ERROR' },
                    }),
                );
            });

            if (this.body) {
                requestStream.write(this.body);
            }

            requestStream.end();
        });
    },
});
