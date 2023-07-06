require('dotenv').config()
const express = require('express')
const server = express()

const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const router = require('./api/routes/routes')

const port = process.env.PORT

const swaggerUI = require('swagger-ui-express')
const apiDoc = require('./api-doc.json')
server.use('/api/docs', swaggerUI.serve, swaggerUI.setup(apiDoc))

server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(cookieParser())
server.use(router)

server.use('/files', express.static('uploads/images'))

server.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
})

server.listen(port, () => {
    console.log(`server is running on port ${port}.`)
})