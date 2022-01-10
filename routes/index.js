const express = require('express')
const router = express.Router()
const recordController = require('../controllers/recordController')
const userController = require('../controllers/userController')
const passport = require('passport')
const { authenticator } = require('../middleware/auth')


router.get('/records/new', authenticator, recordController.createRecord)
router.post('/records', authenticator, recordController.postRecord)
router.get('/records/:recordId/edit', authenticator, recordController.editRecord)
router.put('/records/:recordId', authenticator, recordController.putRecord)
router.delete('/records/:recordId', authenticator, recordController.deleteRecord)
router.get('/users/register', userController.registerPage)
router.post('/users/register', userController.register)
router.get('/users/login', userController.loginPage)
router.post('/users/login', passport.authenticate('local', { failureRedirect: '/users/login' }),userController.login)
router.get('/', authenticator, recordController.getRecords)


module.exports = router