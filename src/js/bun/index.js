module.exports = {
    server: require('./server'),
    client: require('./client'),
    bunttp: new (require('./server').Bunttp)()
}