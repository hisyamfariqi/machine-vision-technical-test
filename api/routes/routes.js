const { Router } = require('express')
const router = Router()
const isAuth = require('../../middleware/jwt-middleware')

// Controllers
const authController = require('../controllers/auth')
const userController = require('../controllers/users')
const postController = require('../controllers/posts')
const fileController = require('../controllers/file')

// Auth
router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.post('/auth/logout', isAuth.verifyToken, authController.logout)

// Users
router.get('/users', isAuth.verifyToken, userController.getUsers)
router.get('/users/:id', isAuth.verifyToken, userController.getUserById)
router.put('/users', isAuth.verifyToken, userController.updateUser)
router.put('/users/change-password', isAuth.verifyToken, userController.changePassword)

// Posts
router.get('/post', isAuth.verifyToken, postController.getPost)
router.get('/post/:id', isAuth.verifyToken, postController.getPostById)
router.get('/post/user/:id', isAuth.verifyToken, postController.getPost)
router.post('/post', isAuth.verifyToken, postController.createPost)
router.put('/post/:id', isAuth.verifyToken, postController.updatePost)
router.delete('/post/:id', isAuth.verifyToken, postController.deletePost)
router.put('/post/like/:id', isAuth.verifyToken, postController.likePost)
router.put('/post/unlike/:id', isAuth.verifyToken, postController.unlikePost)

// File
router.post('/file', fileController.upload)

module.exports = router