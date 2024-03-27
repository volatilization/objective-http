class HttpEndpoint {
    #method;
    #path;

    constructor(method, path) {
        this.#method = method;
        this.#path = path;
    }

    copy(method = this.#method, path = this.#path) {
        return new HttpEndpoint(method, path);
    }

    route() {
        return {
            method: this.#method.toString().toUpperCase(),
            path: this.#path.toString().toLowerCase()
        };
    }

    listen(request, response) {
        return new Promise((resolve) => {
            if (request.method.toString().toUpperCase() === 'POST' || 'PUT') {
                const chunks = [];
                request.on('data', (chunk) => chunks.push(chunk));
                request.on('end', () => resolve(chunks));

            } else {
                resolve();
            }
        });
    }
}

module.exports = HttpEndpoint;