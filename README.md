# objective-http

Proxy objects for creating a http server

## Server

There are all `server` objects feature.  
There are `endpoints` contains all endpoints of your application.  
An endpoint is defined by `request` and `response` types
(usually of the same type).  
`options` is a `node:http` options, who pass when server starting.  
There is an `errorResponse` object for error handling,
and it can be extended. The default behavior is a 500 response status.

### `myServer` object example

```javascript
const http = require('node:http');

const {
    server,
    endpoint: {
        endpoints,
        chunk: { chunkEndpoint },
    },
    request: {
        serverRequest,
        chunk: { serverChunkRequest, serverJsonRequest },
    },
    response: {
        serverResponse,
        chunk: { serverChunkResponse, serverJsonResponse, serverErrorResponse },
    },
} = require('objective-http').server;

const myServer = {
    ...server,
    endpoints: {
        ...endpoints,
        request: serverRequest,
        response: serverResponse,
        collection: [
            {
                ...chunkEndpoint,
                request: serverChunkRequest,
                response: serverChunkResponse,
                origin: myChunkEndpoint,
            },
            {
                ...chunkEndpoint,
                request: serverJsonRequest,
                response: serverJsonResponse,
                origin: myJsonEndpoint,
            },
        ],
    },
    errorResponse: myErrorResponse,
    options: { port: 8080 },
    http,
};
```

### `myEndpoint` object example

```javascript
const myEndpoint = {
    route = {
        method: 'GET',
        path: '/test'
    }

    async handle({ query, headers, body }) {
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

It should be wrapped by `chunkEndpoint` with `serverChunkResponse` and `serverChunkRequest`;

### `myErrorResponse` object example

```javascript
const myErrorResponse = {
    ...serverErrorResponse,
    origin: serverErrorResponse,
    send() {
        let status = 500;

        if (this.error.cause?.code === 'ENDPOINT_NOT_IMPLEMENTED') {
            status = 501;
        }

        if (this.error.cause?.code === 'INVALID_REQUEST') {
            status = 400;
        }

        ({
            ...this.origin,
            stream: this.stream,
            error: this.error,
            status: status,
        }).send();

        return this;
    },
};
```

## Client

Simple wrapper for requests. An `options` passing into `http.request(oprions, ...)`

```javascript
const http = require('node:http');

const {
    request: {
        chunk: { clientChunkRequest, clientJsonRequest },
    },
    response: {
        chunk: { clientChunkResponse, clientJsonResponse },
    },
} = require('../../src/js/client');

const myChunkRequest = {
    ...clientChunkRequest,
    response: clientChunkResponse,
    http: http,
};
const myJsonRequest = {
    ...clientJsonRequest,
    response: clientJsonResponse,
    http: http,
};

// GET

const { status, headers, body } = await {
    ...myChunkRequest,
    url: 'http://example.com',
}.send();

// POST

const { status, headers, body } = await {
    ...myJsonRequest,
    url: 'http://example.com/json',
    options: {
        method: 'POST',
    },
    body: { foo: 'bar' },
}.send();
```
