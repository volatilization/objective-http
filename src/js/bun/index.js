module.exports = {
    server: {
        InputRequest: require('./server/request/InputRequest'),
        OutputResponse: require('./server/response/OutputResponse')
    },
    client: {
        OutputRequest: require('./client/request/OutputRequest'),
        InputResponse: require('./client/response/InputResponse')
    },
    bunttp: new (require('./server/Bunttp'))()
}