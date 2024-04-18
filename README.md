# objective-http
Proxy classes for creating a http server

## Server

There are all ```Server``` classes feature. 
Your endpoints must implement ```Endpoint``` class interface (```route``` and ```handle``` functions).

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

## Client

``` javascript
const https = require('node:https');
const {
    OutputRequest,
    InputResponse
} = require('objective-http').client;


const response = await new OutputRequest(
    https,
    new InputResponse(),
    {
        url: 'https://example.com',
        method: 'POST',
        body: 'test body'
    })
    .send();

console.log(response.body().toString());

//or

const request = new OutputRequest(https, new InputResponse());

const otherResponse = await (request
    .copy({
        url: 'https://example.com',
        method: 'POST',
        body: 'test body'
    }))
    .send()

```