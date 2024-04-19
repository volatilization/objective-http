# objective-http
Proxy classes for creating a http server


## Server

There are all `Server` classes feature.  
Your endpoints must implement `Endpoint` class interface (`route()` and `async handle(request)` methods).

```javascript
const http = require('node:http');
const cluster = require('node:cluster');

const {
    Server,
    ClusteredServer,
    LoggedServer,
    InputRequest,
    JsonInputRequest,
    LoggedInputRequest,
    OutputResponse,
    JsonOutputResponse,
    LoggedOutputResponse,
    Endpoint,
    LoggedEndpoint,
    Endpoints
} = require('objective-http').server;

new ClusteredServer(
    new LoggedServer(
        new Server(
            new Endpoints([
                new MyFirstEndpoint(new LoggedEndpoint(new Endpoint(), console)),
                new MySecondEndpoint(new LoggedEndpoint(new Endpoint(), console)),
                new MyThirdEndpoint(new LoggedEndpoint(new Endpoint(), console))
            ]),
            {port: server_port},
            new LoggedInputRequest(new JsonInputRequest(new InputRequest()), console),
            new LoggedOutputResponse(new JsonOutputResponse(new OutputResponse()), console),
            http
        ),
        console
    ),
    cluster,
    {workers: workers_count}
).start();
```


## Client

```javascript
const http = require('node:http');
const requestFunction = http.request;
const {
    OutputRequest,
    InputResponse
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
[Don't use](https://bun.sh/docs/runtime/nodejs-apis#node-cluster) `ClusteredServer` with `Bun`!!!


### Server Bun usage

It should work with `node` and `bun`:

```javascript
const http = require('node:http');

const {
    Server,
    LoggedServer,
    InputRequest,
    JsonInputRequest,
    LoggedInputRequest,
    OutputResponse,
    JsonOutputResponse,
    LoggedOutputResponse,
    Endpoint,
    LoggedEndpoint,
    Endpoints
} = require('objective-http').server;

new LoggedServer(
    new Server(
        new Endpoints([
            new MyFirstEndpoint(new LoggedEndpoint(new Endpoint(), console)),
            new MySecondEndpoint(new LoggedEndpoint(new Endpoint(), console)),
            new MyThirdEndpoint(new LoggedEndpoint(new Endpoint(), console))
        ]),
        {port: server_port},
        new LoggedInputRequest(new JsonInputRequest(new InputRequest()), console),
        new LoggedOutputResponse(new JsonOutputResponse(new OutputResponse()), console),
        http
    ),
    console
).start()
```

In order for the code to be executed only by `bun` (with `Bun API` inside), you need to make changes to the import block.  
`bun` package redeclare only `InputRequest` and `OutputResponse` classes. Other classes taken from `server` package.

```javascript
const http = require('objective-http').bun.bunttp;

const {
    Server,
    LoggedServer,
    InputRequest,
    JsonInputRequest,
    LoggedInputRequest,
    OutputResponse,
    JsonOutputResponse,
    LoggedOutputResponse,
    Endpoint,
    LoggedEndpoint,
    Endpoints
} = require('objective-http').bun.server;
```


### Client Bun usage

It should work with `node` and `bun`:

```javascript
const http = require('node:http');
const requestFunction = http.request;
const {
    OutputRequest,
    InputResponse
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
const http = require('objective-http').bun.bunttp;
const requestFunction = http.request;
const {
    OutputRequest,
    InputResponse
} = require('objective-http').bun.client;
```