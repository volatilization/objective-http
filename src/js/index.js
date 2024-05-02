module.exports = {
    server: require('./server'),
    client: require('./client'),
    bun: {
        server: {...require('./server'), ...require('./bun').server},
        client: {...require('./client'), ...require('./bun').client},
        bunttp: require('./bun').bunttp
    }
}