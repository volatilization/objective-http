module.exports = class ClusteredServer {
    #origin;
    #cluster;
    #options;

    constructor(origin, cluster, options) {
        this.#origin = origin;
        this.#cluster = cluster;
        this.#options = options;
    }

    async start() {
        if (this.#cluster.isPrimary) {
            for (let i = 0; i < this.#options.workers; i++) {
                this.#cluster.fork();
            }

        } else {
            await this.#origin.start();
        }

        return this;
    }

    options() {
        return {...this.#origin.options(), ...this.#options};
    }
}