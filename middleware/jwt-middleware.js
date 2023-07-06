require('dotenv').config()
const jwt = require('jsonwebtoken')

verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        res.status(403).send({
            success: false,
            message: 'No token provided',
            data: null
        })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            res.status(401).send({
                success: false,
                message: error.message,
                data: null
            })
        } else {
            req.user = user.user
            req.user.token = [token]
            next()
        }
    })
}

module.exports = { verifyToken }