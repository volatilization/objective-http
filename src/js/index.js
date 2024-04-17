module.exports = {
    server: {
        Server: require('./server/Server'),
        LoggedServer: require('./server/LoggedServer'),
        ClusteredServer: require('./server/ClusteredServer'),
        Endpoint: require('./server/endpoint/Endpoint'),
        LoggedEndpoint: require('./server/endpoint/LoggedEndpoint'),
        Endpoints: require('./server/endpoint/Endpoints'),
        InputRequest: require('./server/request/InputRequest'),
        JsonInputRequest: require('./server/request/JsonInputRequest'),
        LoggedInputRequest: require('./server/request/LoggedInputRequest'),
        OutputResponse: require('./server/response/OutputResponse'),
        JsonOutputResponse: require('./server/response/JsonOutputResponse'),
        LoggedOutputResponse: require('./server/response/LoggedOutputResponse')
    },
    client: {
        OutputRequest: require('./client/request/OutputRequest'),
        InputResponse: require('./client/response/InputResponse')
    }
}