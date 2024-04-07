module.exports = class OutputResponse {
    #outputStream;
    #options;

    constructor(outputStream, options) {
        this.#outputStream = outputStream;
        this.#options = {...{statusCode: 200, headers: {}}, ...options};
    }

    copy(outputStream = this.#outputStream, options = this.#options) {
        return new OutputResponse(outputStream, {...{statusCode: 200, headers: {}}, ...options});
    }

    update(options) {
        return new OutputResponse(this.#outputStream, this.#mergeOptions(this.#options, options));
    }

    flush() {
        try {
            this.#outputStream.writeHead(this.#options.statusCode, this.#options.headers)

            if (this.#options.body != null) {
                this.#outputStream.write(this.#options.body);
            }

            return this.#outputStream;

        } finally {
            this.#outputStream.end();
        }
    }

    #mergeOptions(existedOptions, newOptions) {
        if (newOptions.statusCode != null) {
            existedOptions.statusCode = newOptions.statusCode;
        }

        if (newOptions.body != null) {
            existedOptions.body = newOptions.body;
        }

        if (newOptions.headers != null) {
            existedOptions.headers = {...existedOptions.headers, ...newOptions.headers};
        }

        return existedOptions;
    }
}