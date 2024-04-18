const {
    Server,
    LoggedServer,
    JsonOutputResponse,
    JsonInputRequest,
    Endpoints
} = require('../../../js').server;
const {
    // Server,
    InputRequest,
    OutputResponse
} = require('../../../js')
    .bun
    .server;
const http =
    require('../../../js/').bun.bunttp;
// require('http');


new LoggedServer(
    new Server(
        new Endpoints([
            {
                route() {
                    return {
                        method: 'GET',
                        path: '/test'
                    };
                },
                handle(request) {
                    return {
                        statusCode: 200,
                        body: request.query().get('queryKey')
                    };
                }
            },
            {
                route() {
                    return {
                        method: 'POST',
                        path: '/test'
                    };
                },
                handle(request) {
                    return {
                        statusCode: 201,
                        body: request.body()
                    };
                }
            },
        ]),
        {port: 8080},
        new JsonInputRequest(new InputRequest()),
        new JsonOutputResponse(new OutputResponse()),
        http
    ),
    console)
.start()