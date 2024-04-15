const {
    Server,
    LoggedServer,
    InputRequest,
    OutputResponse,
    Endpoints
} = require('../../../js').server;
const http = require('node:http');

new Server(
    http,
    new InputRequest(),
    new OutputResponse(),
    new Endpoints([
        {
            route() {
                return {
                    method: 'GET',
                    path: '/test'
                };
            },
            handle(request) {
                console.log('its GET /test');
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
                console.log('its GET /test');
                return {
                    statusCode: 201,
                    body: request.body().toString()
                };
            }
        },
    ]),
    {port: 8080}
).start()
.then(() => console.log(8080))