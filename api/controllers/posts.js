const pool = require('../../db')

// Get posts
const getPost = async (req, res) => {
    const id = req.params.id != null ? parseInt(req.params.id) : null
    const searchBy = req.query.searchBy
    const search = req.query.search
    const page = req.query.page != null ? parseInt(req.query.page) : 1
    const limit = req.query.limit != null ? parseInt(req.query.limit) : 10

    // const total = pool.query(`SELECT COUNT(*) AS total FROM posts`, (error, reslt) => {
    //     console.log(reslt.rows[0].total)
    //     return reslt.rows[0].total
    // })
    const startIndex = (page - 1) * limit
    // const totalPage = await Math.ceil(total / limit)

    let query = `SELECT * FROM posts `
    let filterCount = 0

    if (id != null) {
        query = query + `WHERE user_id = ${id} `
        filterCount++
    }
    if (search != null) {
        if (searchBy == 'tags') {
            query = filterCount > 0 ? `AND tags ILIKE '#${search}' ` : query + `WHERE tags ILIKE '#${search}' `
        } else {
            query = filterCount > 0 ? `AND caption ILIKE '${search}' ` : query + `WHERE caption ILIKE '${search}' `
        }
    }
    if (startIndex != null) {
        query = query + `ORDER BY created_at DESC OFFSET ${startIndex} `
    }
    if (limit != null) {
        query = query + `LIMIT ${limit}`
    }

    await pool.query(query)
        .then(async results => {
            if (results.rowCount == 0) {
                res.status(200).json({
                    success: true,
                    message: 'Successfully get posts',
                    data: results.rows
                })
            }
            let i = 0
            let customArray = []

            results.rows.forEach(async r => {
                await pool.query(`SELECT * FROM users WHERE id = ${r.user_id}`)
                    .then(async results2 => {
                        r.user = {
                            name: results2.rows[0].name,
                            username: results2.rows[0].username,
                            email: results2.rows[0].email,
                            photo: results2.rows[0].photo
                        }

                        customArray.push(r)
                        i++

                        if (i == results.rowCount) {
                            res.status(200).json({
                                success: true,
                                message: 'Successfully get posts',
                                data: customArray,
                                pagination: {
                                    // total: totalPage,
                                    page: page,
                                    limit: limit
                                }
                            })
                        }
                    })
                    .catch(error => {
                        res.status(500).json({
                            success: false,
                            message: error.message,
                            data: null
                        })
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

// Get post by ID
const getPostById = async (req, res) => {
    const id = req.params.id

    await findPostById(res, id, 'Successfully get post')
}

// Create a new post
const createPost = async (req, res) => {
    const id = req.user.userId
    const { image, caption, tags } = req.body

    await pool.query(`INSERT INTO posts (user_id, caption, tags, likes, images) VALUES (${id}, '${caption}', '${tags}', 0, '${image}') RETURNING id`)
        .then(async results => {
            await findPostById(res, results.rows[0].id, 'Succesfully created a post')
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: error.message,
                data: null
            })
        })
}

// Update a post
const updatePost = async (req, res) => {
    const id = parseInt(req.params.id)
    const { image, caption, tags } = req.body

    await pool.query(`UPDATE posts SET images = '${image}', caption = '${caption}', tags = '${tags}', updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`)
        .then(async results => {
            await findPostById(res, id, 'Successfully updated a post')
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: error.message,
                data: null
            })
        })
}

// Delete a post
const deletePost = async (req, res) => {
    const id = parseInt(req.params.id)

    await pool.query(`DELETE FROM posts WHERE id = ${id}`)
        .then(results => {
            res.status(200).json({
                success: true,
                message: 'Successfully delete the post',
                data: null
            })
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: error.message,
                data: null
            })
        })
}

const likePost = async (req, res) => {
    const id = parseInt(req.params.id)
    const { userId } = req.body

    await pool.query(`INSERT INTO user_liked (post_id, user_id) VALUES(${id}, ${userId})`)
        .then(async results => {
            await pool.query(`UPDATE posts SET likes = (SELECT COUNT(*) FROM user_liked WHERE post_id = ${id}) WHERE id = ${id}`)
                .then(results2 => {
                    res.status(200).json({
                        success: true,
                        message: 'Successfully liked the post',
                        data: null
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

const unlikePost = async (req, res) => {
    const id = parseInt(req.params.id)
    const { userId } = req.body

    await pool.query(`DELETE FROM user_liked WHERE post_id = ${id} AND user_id = ${userId}`)
        .then(async results => {
            await pool.query(`UPDATE posts SET likes = (SELECT COUNT(*) FROM user_liked WHERE post_id = ${id}) WHERE id = ${id}`)
                .then(results2 => {
                    res.status(200).json({
                        success: true,
                        message: 'Successfully unliked the post',
                        data: null
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

async function findPostById(res, id, message) {
    await pool.query(`SELECT posts.images, posts.caption, posts.tags, posts.likes, posts.created_at, posts.updated_at, users."name" AS user_name, users.username AS username, users.email AS user_email, users.photo AS user_photo FROM "posts" JOIN users ON user_id = users.id WHERE posts.id = ${id}`)
        .then(results2 => {
            res.status(201).json({
                success: true,
                message: message,
                data: {
                    image: results2.rows[0].images,
                    caption: results2.rows[0].caption,
                    tags: results2.rows[0].tags,
                    likes: results2.rows[0].likes,
                    created_at: results2.rows[0].created_at,
                    updated_at: results2.rows[0].updated_at,
                    user: {
                        name: results2.rows[0].user_name,
                        username: results2.rows[0].username,
                        email: results2.rows[0].user_email,
                        photo: results2.rows[0].user_photo
                    }
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

module.exports = { getPost, getPostById, createPost, updatePost, deletePost, likePost, unlikePost }