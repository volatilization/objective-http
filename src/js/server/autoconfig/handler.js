function collectionEndpointHandler({ endpoints }) {
    const { EndpointHandlers } = require('../index').handler.endpoint;

    return new EndpointHandlers({
        handlers: endpoints.map((endpoint) => endpointHandler({ endpoint })),
    });
}

function endpointHandler({ endpoint }) {
    const {
        request: {
            chunk: { JsonServerRequest, ChunkServerRequest },
        },
        response: {
            chunk: { JsonServerResponse, ChunkServerResponse },
        },
    } = require('../index');

    const request = new JsonServerRequest({
        origin: new ChunkServerRequest({}),
    });

    const response = new JsonServerResponse({
        origin: new ChunkServerResponse({}),
    });

    if (
        endpoint instanceof Array &&
        endpoint?.some((innerEndpoint) => innerEndpoint instanceof Array)
    ) {
        return collectionEndpointHandler({ endpoints: endpoint });
    }

    if (endpoint instanceof Array) {
        const { EndpointsHandler } = require('../index').handler.endpoint;

        return new EndpointsHandler({
            endpoints: endpoint,
            request,
            response,
        });
    }

    const { EndpointHandler } = require('../index').handler.endpoint;

    return new EndpointHandler({
        endpoint,
        request,
        response,
    });
}

function loggHandler({ env, handler }) {
    if ([undefined, null, 'disable', 'off'].includes(env?.SERVER_ERROR_LOG)) {
        return handler;
    }

    const { LogErrorHandler } = require('../index').handler.error;
    const console = require('node:console');
    const { inspect } = require('node:util');

    return new LogErrorHandler({
        origin: handler,
        logger: console,
        inspect,
    });
}

module.exports = function handler({
    env,
    errorHandler = ({ origin }) => {
        return origin;
    },
    endpoints,
}) {
    const {
        handler: {
            endpoint: { EndpointRequiredHandler },
            error: {
                UnexpectedErrorHandler,
                InvalidRequestErrorHandler,
                HandlerNotFoundErrorHandler,
            },
        },
        response: {
            chunk: { ChunkServerResponse },
        },
    } = require('../index');

    return new UnexpectedErrorHandler({
        origin: loggHandler({
            handler: errorHandler({
                origin: new InvalidRequestErrorHandler({
                    origin: new HandlerNotFoundErrorHandler({
                        origin: new EndpointRequiredHandler({
                            origin: endpointHandler({
                                endpoint: endpoints,
                            }),
                        }),
                        response: new ChunkServerResponse({}),
                    }),
                    response: new ChunkServerResponse({}),
                }),
                response: new ChunkServerResponse({}),
            }),
            env,
        }),
        response: new ChunkServerResponse({}),
    });
};
