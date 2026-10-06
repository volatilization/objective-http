module.exports = {
    getStatus() {
        return this.statusMap.get(this.getError());
    },

    getOrigin(proxy = this) {
        return {
            ...this.origin?.getOrigin(proxy),
            ...(this.origin ?? this),
            statusMap: proxy.statusMap,
        };
    },
};
