const http = require('node:http');
const {
    request: {
        chunk: { ChunkClientRequest },
    },
    response: {
        chunk: { ChunkClientResponse },
    },
} = require('../../../js').client;
const request = new ChunkClientRequest({
    http: http,
    response: new ChunkClientResponse({}),
});

request
    .with({
        options: {
            host: 'localhost',
            port: 8080,
            path: '/test?queryKey=322',
        },
    })
    .send()
    .then((response) => {
        console.log('response is', response.status);
        console.log('response is', response.body.toString());
    });

request
    .with({
        options: {
            host: 'localhost',
            port: 8080,
            method: 'POST',
            path: '/test?queryKey=322',
        },
        body: 'nigga',
    })
    .send()
    .then((response) => {
        console.log('response is', response.status);
        console.log('response is', response.body.toString());
    });
