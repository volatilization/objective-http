const http = require('node:http');
const {
    Server,
    handler: {
        endpoint: { EndpointsHandler },
        error: {
            UnexpectedErrorHandler,
            InvalidRequestErrorHandler,
            HandlerNotFoundErrorHandler,
        },
    },
    request: {
        chunk: { ChunkServerRequest },
    },
    response: {
        chunk: { ChunkServerResponse },
    },
} = require('../../../js').server;

const serverConfig = new Server({
    handler: new UnexpectedErrorHandler({
        origin: new InvalidRequestErrorHandler({
            origin: new HandlerNotFoundErrorHandler({
                origin: new EndpointsHandler({
                    endpoints: [
                        {
                            route: {
                                method: 'GET',
                                path: '/test',
                            },

                            handle(request) {
                                return {
                                    status: 200,
                                    body: request.query.get('queryKey'),
                                };
                            },
                        },
                        {
                            route: {
                                method: 'POST',
                                path: '/test',
                            },

                            handle(request) {
                                return {
                                    status: 201,

                                    body: request.body.toString(),
                                };
                            },
                        },
                        {
                            route: {
                                method: 'GET',
                                path: '/error',
                            },

                            handle() {
                                throw new Error('WTF');
                            },
                        },
                    ],
                    request: new ChunkServerRequest({}),
                    response: new ChunkServerResponse({}),
                }),
                response: new ChunkServerResponse({}),
            }),
            response: new ChunkServerResponse({}),
        }),
        response: new ChunkServerResponse({}),
    }),

    options: { port: 8080 },
    http,
});

serverConfig.start().then(() => console.log('server started'));
