const http = require('http')
const app = require('./app')
const config = require('./lib/config')
const Logger = require('./lib/logger')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  Logger.log(`Server running on port ${config.PORT}`)
})

