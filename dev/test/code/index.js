const http = require('node:http');
const cluster = require('node:cluster');

const {
    HttpServer,
    LogHttpServer,
    ClusterHttpServer,
    HttpEndpoint,
    LogHttpEndpoint,
    HttpEndpoints,
    HttpInputRequest,
    JsonHttpInputRequest,
    LogHttpInputRequest,
    HttpOutputResponse,
    JsonHttpOutputResponse,
    LogHttpOutputResponse
} = require('../../code/index');
const PostTestEndpoint = require('./http/endpont/PostTestEndpoint');
const GetTestEndpoint = require('./http/endpont/GetTestEndpoint');
const ErrorTestEndpoint = require('./http/endpont/ErrorTestEndpoint');

new ClusterHttpServer(
    new LogHttpServer(
        new HttpServer(
            http,
            new LogHttpInputRequest(new JsonHttpInputRequest(new HttpInputRequest()), console),
            new LogHttpOutputResponse(new JsonHttpOutputResponse(new HttpOutputResponse()), console),
            new HttpEndpoints([
                new GetTestEndpoint(new LogHttpEndpoint(new HttpEndpoint(), console)),
                new PostTestEndpoint(new LogHttpEndpoint(new HttpEndpoint(), console)),
                new ErrorTestEndpoint(new LogHttpEndpoint(new HttpEndpoint(), console))
            ]),
            {port: 8080}
        ),
        console
    ),
    cluster,
    {workers: 4}
).start();