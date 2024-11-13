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
        return new OutputRequest(response, http, {method: 'GET', ...options});
    }

    send() {
        return new Promise((resolve, reject) => {
            try {
                const requestOutputStream = this.#requestFunction(
                    this.#options.url,
                    this.#options,
                    async (responseInputStream) => {
                        try {
                            resolve(await this.#response
                                .copy(responseInputStream)
                                .flush());

                        } catch (e) {
                            reject(new Error(e.message, {cause: 'INVALID_REQUEST'}));
                        }
                    });

                requestOutputStream.once('error', e => {
                    reject(new Error(e.message, {cause: 'INVALID_REQUEST'}));
                });

                if (this.#needToByWritten(this.#options)) {
                    requestOutputStream.write(this.#options.body);
                }

                requestOutputStream.end();

            } catch (e) {
                reject(new Error(e.message, {cause: 'INVALID_REQUEST'}));
            }
        });
    }

    #needToByWritten(options) {
        return ['POST', 'PUT'].some(method => method === options.method.toString().toUpperCase())
            && (options.body != null && typeof options.body === 'string');
    }
};