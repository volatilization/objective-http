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

    async send() {
        try {
            return await new Promise((resolve, reject) => {
                this.#sendRequestOutputStream(
                    this.#configureRequestOutputStream(this.#requestFunction, this.#response, this.#options, resolve, reject),
                    this.#options,
                    reject);
            });

        } catch (e) {
            if (e.cause == null) {
                throw new Error(e.message, {cause: 'INVALID_REQUEST'});
            }

            throw e;
        }
    }

    #sendRequestOutputStream(requestOutputStream, options, reject) {
        try {
            requestOutputStream.once('error', e => reject(e));

            if (this.#needToByWritten(options)) {
                requestOutputStream.write(options.body);
            }

            requestOutputStream.end();

        } catch (e) {
            reject(e);
        }
    }

    #needToByWritten(options) {
        return ['POST', 'PUT'].some(method => method === options.method.toString().toUpperCase())
            && (options.body != null && typeof options.body === 'string');
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
};