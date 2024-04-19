module.exports = class OutputRequest {
    #response;
    #requestFunction;
    #options;

    constructor(response, requestFunction, options) {
        this.#response = response;
        this.#requestFunction = requestFunction;
        this.#options = {method: 'GET', ...options};
    }

    copy(options = this.#options, response = this.#response, http = this.#requestFunction) {
        return new OutputRequest(response, http,  {method: 'GET', ...options});
    }

    send() {
        return new Promise((resolve, reject) => {
            try {
                this.#sendRequestOutputStream(
                    this.#configureRequestOutputStream(this.#requestFunction, this.#response, this.#options, resolve, reject),
                    this.#options);

            } catch (e) {
                throw new Error(e.message, {cause: 'INVALID_REQUEST'});
            }
        });
    }

    #configureRequestOutputStream(requestFunction, response, options, resolve, reject) {
        if (options.url != null) {
            return requestFunction(
                options.url,
                options,
                async (responseInputStream) => {
                    await this.#flushResponseInputStream(responseInputStream, response, resolve, reject);
                });
        }

        return requestFunction(
            options,
            async (responseInputStream) => {
                await this.#flushResponseInputStream(responseInputStream, response, resolve, reject);
            });
    }

    async #flushResponseInputStream(responseInputStream, response, resolve, reject) {
        try {
            resolve(await response
                .copy(responseInputStream)
                .flush());

        } catch (e) {
            reject(e);
        }
    }

    #sendRequestOutputStream(requestOutputStream, options) {
        if (this.#needToByWritten(options)) {
            requestOutputStream.write(options.body);
        }

        requestOutputStream.end();
    }

    #needToByWritten(options) {
        return ['POST', 'PUT'].some(method => method === options.method.toString().toUpperCase())
            && (options.body != null && typeof options.body === 'string');
    }
};