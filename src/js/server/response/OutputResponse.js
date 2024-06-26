module.exports = class OutputResponse {
    #options;
    #outputStream;

    constructor(options, outputStream) {
        this.#options = {...{statusCode: 200, headers: {}}, ...options};
        this.#outputStream = outputStream;
    }

    copy(options = this.#options, outputStream = this.#outputStream) {
        return new OutputResponse({...{statusCode: 200, headers: {}}, ...options}, outputStream);
    }

    update(options) {
        return new OutputResponse(this.#mergeOptions(this.#options, options), this.#outputStream);
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
        if (newOptions == null) {
            return existedOptions;
        }

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