module.exports = {
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

            throw new Error(`Invalid client json response. Body was ${body}`, {
                cause: { error: e, code: 'RESPONSE_ERROR' },
            });
        }
    },
};
