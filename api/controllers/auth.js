require('dotenv').config()
const pool = require('../../db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')

// Register
const register = async (req, res) => {
    const { name, username, email, password, photo } = req.body

    // If password is less than 8 chars
    if (password.length < 8) {
        res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long',
            data: null
        })
    }

    // If email isValid
    if (validator.isEmail(`${email}`) == false) {
        res.json({
            success: false,
            message: 'Invalid email',
            data: null
        })
    } else {
        // If email exists
        await pool.query(`SELECT email FROM users WHERE email = '${email}'`)
            .then(async results => {
                if (results.rowCount != 0) {
                    res.json({
                        success: false,
                        message: 'Email already exists',
                        data: null
                    })
                } else {
                    // Email available
                    const hashPassword = await bcrypt.hash(password, 10)

                    await pool.query(`INSERT INTO users (name, username, email, password, photo) VALUES ('${name}', '${username}', '${email}', '${hashPassword}', '${photo}') RETURNING id`)
                        .then(results2 => {
                            res.status(201).json({
                                success: true,
                                message: 'Your account has been successfully created',
                                data: {
                                    name: name,
                                    username: username,
                                    email: email,
                                    photo: photo
                                }
                            })
                        }).catch(error => {
                            res.status(500).json({
                                success: false,
                                message: error.message,
                                data: null
                            })
                        })
                }
            }).catch(error => {
                res.status(500).json({
                    success: false,
                    message: error.message,
                    data: null
                })
            })
    }
}

// Login
const login = (req, res) => {
    const { username, password } = req.body

    pool.query(`SELECT * FROM users WHERE username = $1`, [username])
        .then(async results => {
            try {
                if (results.rowCount == 0) {
                    res.status(404).json({
                        success: false,
                        message: 'Username not found',
                        data: null
                    })
                } else if (!await bcrypt.compare(password, results.rows[0].password)) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid password!',
                        data: null
                    })
                } else {
                    userId = results.rows[0].id
                    userUniqueName = results.rows[0].username
                    userName = results.rows[0].name
                    userEmail = results.rows[0].email
                    userPhoto = results.rows[0].photo

                    const user = { userId, userUniqueName, userName, userEmail, userPhoto }

                    let accessToken = generateToken(user, true)
                    let refreshToken = generateToken(user, false)

                    res.status(200).json({
                        success: true,
                        message: 'Successfully logged in',
                        data: {
                            accessToken,
                            refreshToken
                        }
                    })

                }
            } catch (error) {
                res.json({
                    success: false,
                    message: error.message,
                    data: null
                })
            }
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: error.message,
                data: null
            })
        })
}

const logout = (req, res) => {
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authorization failed!',
                data: null
            })
        }

        let tokens = req.user.token
        tokens = tokens.filter(t => t !== token)

        res.status(200).json({
            success: true,
            message: 'Successfully logged out',
            data: null
        })
    }
}

// Generate new access token
function generateToken(user, isAccessToken) {
    const token = jwt.sign({ user }, isAccessToken ? process.env.ACCESS_TOKEN_SECRET
        : process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: isAccessToken ? '15m' : '20m' })

    return token
}

module.exports = { register, login, logout }