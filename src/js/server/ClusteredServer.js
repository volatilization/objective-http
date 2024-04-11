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
            return new ClusteredServer(await this.#origin.start(), this.#cluster, this.#options);
        }
    }

    options() {
        return {...this.#origin.options(), ...this.#options};
    }
}