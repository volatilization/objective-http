
# objective-http

Proxy classes for creating a http server

## Server

There are all `Server` classes feature.  
Your endpoints should implement `Endpoint` class interface 
(`get route()` and `async handle(request)` methods).  
Also you can add own handlers (`handle(reqestStream, responseStream)`).  
`Handler` is a top level logic object, who intrreact with IO streams directly.  
`options` is a `node:http` options, who pass when server starting.  

```javascript
const http = require('node:http');
const console = require('node:console');
const {
    Server,
    handler: {
        endpoint: {
            EndpointHandler,
            EndpointsHandler,
            EndpointHandlers,
            EndpointRequiredHandler,
        },
        error: {
            LogErrorHandler,
            UnexpectedErrorHandler,
            InvalidRequestErrorHandler,
            HandlerNotFoundErrorHandler,
        },
    },
    request: {
        chunk: { JsonServerRequest, ChunkServerRequest },
    },
    response: {
        chunk: { JsonServerResponse, ChunkServerResponse },
    },
} = require('objective-http').server;

new Server({
    handler: new UnexpectedErrorHandler({
        origin: new LogErrorHandler({
            origin: new InvalidRequestErrorHandler({
                origin: new HandlerNotFoundErrorHandler({
                    origin: new EndpointRequiredHandler({
                        origin: new EndpointHandlers({
                            handlers: [
                                new EndpointHandler({
                                    endpoint: new MyEndpoint(),
                                    request: new ChunkServerRequest({}),
                                    response: new ChunkServerResponse({}),
                                }),
                                new EndpointHandler({
                                    endpoint: new MyEndpoint(),
                                    request: new ChunkServerRequest({}),
                                    response: new ChunkServerResponse({})
                                }),
                                new EndpointsHandler({
                                    endpoints: [
                                       new MyJsonEndpoint(),
                                       new MyJsonEndpoint(),
                                       new MyJsonEndpoint(),
                                    ],
                                    request: new JsonServerRequest({
                                        origin: new ChunkServerRequest({}),
                                    }),
                                    response: new JsonServerResponse({
                                        origin: new ChunkServerResponse({}),
                                    }),
                                }),
                            ],
                        }),
                    }),
                    response: new ChunkServerResponse({}),
                }),
                response: new ChunkServerResponse({}),
            }),
            logger: console,
        }),
        response: new ChunkServerResponse({}),
    }),

    options: { port: 8080 },
    http,
});
```

`MyEndpoint` class example:

```javascript
class MyEndpoint {
    route = {
        method: 'GET',
        path: '/test'
    }

    async handle(request) {
        try {
            const processResult = await someProcess();

            return {
                status: 200,
                body: processResult.toString()
            };
        
        } catch (e) {
            return {
                status: 404,
                body: 'process does not found anything'
            };
        }
    }
}

```

## Client

Simple wrapper for requests. `options` passing into `http.request(oprions, ...)`

```javascript
const http = require('node:http');
const {
    request: {
        chunk: { JsonClientRequest, ChunkClientRequest },
    },
    response: {
        chunk: { JsonClientResponse, ChunkClientResponse },
    },
} = require('objective-http').client;

const request = new JsonClientRequest({
    origin: new ChunkClientRequest({
        http: http,
        response: new JsonClientResponse({
            origin: new ChunkClientResponse({})
        }),
    }),
});

const response = await request
    .with({
        options: {
            host: 'localhost',
            port: 80,
            method: 'GET',
            path: '/test',
        },
        body: { some: 'body' }
    })
    .send()

console.log(JSON.stringify(response.body));
```

