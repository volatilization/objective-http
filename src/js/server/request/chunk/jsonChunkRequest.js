module.exports = {
    getQuery() {
        return Object.fromEntries(this.getOrigin().getQuery());
    },

    getHeaders() {
        return Object.fromEntries(this.getOrigin().getHeaders());
    },

    getBody() {
        const body = this.getOrigin().getBody();

        if (body?.length <= 0) {
            return body;
        }

        try {
            return JSON.parse(body.toString());
        } catch (e) {
            if (!(e instanceof SyntaxError)) {
                throw e;
            }
            throw new Error(`Invalid server json request. Body was ${body}`, {
                cause: { error: e, code: 'INVALID_REQUEST' },
            });
        }
    },
};
