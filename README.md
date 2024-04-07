# objective-http
Proxy classes for creating a http server

## Using

``` javascript
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
} = require('../../../js').server; = require('objective-http').server;

new ClusteredServer(
    new LoggedServer(
        new Server(
            http,
            new LoggedInputRequest(new JsonInputRequest(new InputRequest()), console),
            new LoggedOutputResponse(new JsonOutputResponse(new OutputResponse()), console),
            new Endpoints([
                new GetTestEndpoint(new LoggedEndpoint(new Endpoint(), console)),
                new PostTestEndpoint(new LoggedEndpoint(new Endpoint(), console)),
                new ErrorTestEndpoint(new LoggedEndpoint(new Endpoint(), console))
            ]),
            {port: server_port}
        ),
        console
    ),
    cluster,
    {workers: workers_count}
).start();
```