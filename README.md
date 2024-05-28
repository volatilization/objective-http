# objective-http
Proxy classes for creating a http server


## Server

There are all `Server` classes feature.  
Your endpoints must implement `Endpoint` class interface (`route()` and `async handle(request)` methods).

```javascript
const createServerFunction = require('node:http').createServer;

const {
    Server,
    LoggedServer,
    endpoint: {
        Endpoint,
        LoggedEndpoint,
        Endpoints
    },
    request: {
        InputRequest,
        JsonInputRequest,
        LoggedInputRequest,
    },
    response: {
        OutputResponse,
        JsonOutputResponse,
        LoggedOutputResponse
    }
} = require('objective-http').server;

new LoggedServer(
    new Server(
        new Endpoints([
            new LoggedEndpoint(new MyFirstEndpoint(), console),
            new LoggedEndpoint(new MySecondEndpoint(), console),
            new LoggedEndpoint(new MyThirdEndpoint(), console)
        ]),
        {port: server_port},
        new LoggedInputRequest(new JsonInputRequest(new InputRequest()), console),
        new LoggedOutputResponse(new JsonOutputResponse(new OutputResponse()), console),
        createServerFunction
    ),
    console
).start();
```

`MyEndpoint` class example:

```javascript
class MyEndpoint {
    route() {
        return {
            method: 'GET',
            path: '/test'
        };
    }

    async handle(request) {
        try {
            const processResult = await someProcess();

            return {
                statusCode: 200,
                body: processResult.toString()
            };
        
        } catch (e) {
            return {
                statusCode: 404,
                body: 'process does not found anything'
            };
        }
    }
}

```

## Client

```javascript
const requestFunction = require('node:http').request;

const {
    request: {
        OutputRequest
    },
    response: {
        InputResponse
    }
} = require('objective-http').client;


const response = await new OutputRequest(
    new InputResponse(),
    requestFunction,
    {
        url: 'https://example.com',
        method: 'POST',
        body: 'test body'
    })
    .send();

console.log(response.body().toString());

//or

const request = new OutputRequest(new InputResponse(), requestFunction);

const otherResponse = await (request
    .copy({
        url: 'https://example.com',
        method: 'POST',
        body: 'test body'
    }))
    .send();

console.log(response.body().toString());
```


## [Bun](https://bun.sh) support

`server` and `client` packages support Bun by default.  
But there ara special `bun` package with native [Bun API](https://bun.sh/docs/runtime/bun-apis) implementation (like `Bun.serve()`). 
And you should replace `node:http` package with `objective-http.bun.bunttp` in your `Server` configuration.


### Server Bun usage

It should work with `node` and `bun`:

```javascript
const createServerFunction = require('node:http').createServer;

const {
    Server,
    LoggedServer,
    endpoint: {
        Endpoint,
        LoggedEndpoint,
        Endpoints
    },
    request: {
        InputRequest,
        JsonInputRequest,
        LoggedInputRequest,
    },
    response: {
        OutputResponse,
        JsonOutputResponse,
        LoggedOutputResponse
    }
} = require('objective-http').server;

new LoggedServer(
    new Server(
        new Endpoints([
            new LoggedEndpoint(new MyFirstEndpoint(), console),
            new LoggedEndpoint(new MySecondEndpoint(), console),
            new LoggedEndpoint(new MyThirdEndpoint(), console)
        ]),
        {port: server_port},
        new LoggedInputRequest(new JsonInputRequest(new InputRequest()), console),
        new LoggedOutputResponse(new JsonOutputResponse(new OutputResponse()), console),
        createServerFunction
    ),
    console
).start()
```

In order for the code to be executed only by `bun` (with `Bun API` inside), you need to make changes to the import block.  
`bun` package redeclare only `InputRequest` and `OutputResponse` classes. Other classes taken from `server` package.

```javascript
const createServerFunction = require('objective-http').bun.bunttp.createServer;

const {
    Server,
    LoggedServer,
    endpoint: {
        Endpoint,
        LoggedEndpoint,
        Endpoints
    },
    request: {
        JsonInputRequest,
        LoggedInputRequest,
    },
    response: {
        JsonOutputResponse,
        LoggedOutputResponse
    }
} = require('objective-http').server;

const {
    request: {
        InputRequest
    },
    response: {
        OutputResponse
    }
} = require('objective-http').bun.server;
```


### Client Bun usage

It should work with `node` and `bun`:

```javascript
const requestFunction = require('node:http').request;

const {
    request: {
        OutputRequest
    },
    response: {
        InputResponse
    }
} = require('objective-http').client;

await (new OutputRequest(new InputResponse(), requestFunction)
    .copy({
        url: 'https://example.com',
        method: 'POST',
        body: 'test body'
    }))
    .send();
```

In order for the code to be executed only by `bun`, you need to make changes to the import block.

```javascript
const requestFunction = require('objective-http').bun.bunttp.request;

const {
    request: {
        OutputRequest
    },
    response: {
        InputResponse
    }
} = require('objective-http').bun.client;
```