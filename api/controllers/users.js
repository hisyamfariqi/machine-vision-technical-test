const pool = require('../../db')
const validator = require('validator')
const bcrypt = require('bcrypt')

// Get authenticated user's profile
const getUsers = async (req, res) => {
    const id = req.user.userId

    await pool.query('SELECT name, username, email, photo, created_at, updated_at FROM users WHERE id = $1', [id])
        .then(results => {
            res.status(200).json({
                success: true,
                message: 'Successfully get users profile',
                data: results.rows[0]
            })
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: error.message,
                data: null
            })
        })
}

// Get user by ID
const getUserById = async (req, res) => {
    const id = parseInt(req.params.id)

    await pool.query(`SELECT name, username, email, photo, created_at, updated_at FROM users WHERE id = ${id}`)
        .then(results => {
            res.status(200).json({
                success: true,
                message: 'Successfully get user',
                data: results.rows[0]
            })
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: error.message,
                data: null
            })
        })
}

// Update a user
const updateUser = async (req, res) => {
    const id = req.user.userId
    const { name, username, email, photo } = req.body

    if (validator.isEmail(`${email}`) == false) {
        res.json({
            success: false,
            message: 'Invalid email',
            data: null
        })
    } else {
        await pool.query('UPDATE users SET name = $1, username = $2, email = $3, photo = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5', [name, username, email, photo, id])
            .then(async results => {
                await pool.query(`SELECT name, username, email, photo, created_at, updated_at FROM users WHERE id = ${id}`)
                    .then(results2 => {
                        res.status(200).json({
                            success: true,
                            message: 'Successfully update user',
                            data: results2.rows[0]
                        })
                    }).catch(error => {
                        res.status(500).json({
                            success: false,
                            message: error.message,
                            data: null
                        })
                    })
            }).catch(error => {
                res.status(500).json({
                    success: false,
                    message: error.message,
                    data: null
                })
            })
    }
}

const changePassword = async (req, res) => {
    const id = req.user.userId
    const { oldPassword, newPassword, confirmedNewPassword } = req.body

    await pool.query(`SELECT password FROM users WHERE id = ${id}`)
        .then(async results => {
            if (await bcrypt.compare(oldPassword, results.rows[0].password)) {
                if (newPassword == confirmedNewPassword && newPassword != oldPassword) {
                    const hashPassword = await bcrypt.hash(newPassword, 10)

                    await pool.query(`UPDATE users SET password = '${hashPassword}', updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`)
                        .then(results2 => {
                            res.status(200).json({
                                success: true,
                                message: 'Successfully change password',
                                data: null
                            })
                        }).catch(error => {
                            res.status(500).json({
                                success: false,
                                message: error.message,
                                data: null
                            })
                        })
                } else {
                    res.json({
                        success: false,
                        message: 'New password and confirmed new password does not match',
                        data: null
                    })
                }
            } else {
                res.json({
                    success: false,
                    message: 'Old password does not match',
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
module.exports = { getUsers, getUserById, updateUser, changePassword }