module.exports = {
    server: {
        InputRequest: require('./server/request/InputRequest'),
        OutputResponse: require('./server/response/OutputResponse'),
    },
    bunttp: new (require('./server/Bunttp'))()
}