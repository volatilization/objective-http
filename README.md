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
} = require('objective-http').server;

new ClusteredServer(
    new LoggedServer(
        new Server(
            http,
            new LoggedInputRequest(new JsonInputRequest(new InputRequest()), console),
            new LoggedOutputResponse(new JsonOutputResponse(new OutputResponse()), console),
            new Endpoints([
                new MyFirstEndpoint(new LoggedEndpoint(new Endpoint(), console)),
                new MySecondEndpoint(new LoggedEndpoint(new Endpoint(), console)),
                new MyThirdEndpoint(new LoggedEndpoint(new Endpoint(), console))
            ]),
            {port: server_port}
        ),
        console
    ),
    cluster,
    {workers: workers_count}
).start();
```