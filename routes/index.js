const express = require('express')
const router = express.Router()
const recordController = require('../controllers/recordController')
const userController = require('../controllers/userController')
const passport = require('passport')
const { authenticator, authenticatedCheck } = require('../middleware/auth')


// routing for records model
router.get('/records/new', authenticator, recordController.createRecord)
router.post('/records', authenticator, recordController.postRecord)
router.get('/records/:recordId/edit', authenticator, recordController.editRecord)
router.put('/records/:recordId', authenticator, recordController.putRecord)
router.delete('/records/:recordId', authenticator, recordController.deleteRecord)

// routing for users model
router.get('/users/register', userController.registerPage)
router.post('/users/register', userController.register)
router.get('/users/login', userController.loginPage)
router.post('/users/login', passport.authenticate('local', { failureRedirect: '/users/login' }), userController.login)
router.get('/users/logout', userController.logout)

// routing for local email verification
router.get('/auth/local/callback', authenticatedCheck, userController.localCallback)
router.get('/auth/local/page', authenticatedCheck, userController.verifyPage)
router.get('/auth/local/verify', authenticatedCheck, userController.verify)

// routing for home page
router.get('/', authenticator, recordController.getRecords)


module.exports = router