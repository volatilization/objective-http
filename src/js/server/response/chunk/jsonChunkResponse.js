module.exports = {
    getHeaders() {
        return {
            ...this.getOrigin({ ...this, body: this.getBody() }).getHeaders(),
            'content-type': 'application/json',
        };
    },

    getBody() {
        return JSON.stringify(this.body);
    },
};
