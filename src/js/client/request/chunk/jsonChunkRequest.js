module.exports = {
    getOptions() {
        const options = this.getOrigin({
            ...this,
            body: this.getBody(),
        }).getOptions();

        return {
            ...options,
            headers: {
                ...options?.headers,
                'content-type': 'application/json',
            },
        };
    },

    getBody() {
        return JSON.stringify(this.body);
    },
};
