module.exports = class ClusteredServer {
    #origin;
    #cluster;
    #options;

    constructor(origin, options, cluster) {
        this.#origin = origin;
        this.#options = options;
        this.#cluster = cluster;
    }

    async start() {
        if (this.#cluster.isPrimary) {
            for (let i = 0; i < this.#options.workers; i++) {
                this.#cluster.fork();
            }

        } else {
            return new ClusteredServer(await this.#origin.start(), this.#cluster, this.#options);
        }
    }

    async stop() {
        return new ClusteredServer(await this.#origin.stop(), this.#cluster, this.#options);
    }

    options() {
        return {...this.#origin.options(), ...this.#options};
    }
}