const express = require('express')
const router = express.Router()
const recordController = require('../controllers/recordController')
const userController = require('../controllers/userController')


router.get('/records/new', recordController.createRecord)
router.post('/records', recordController.postRecord)
router.get('/records/:recordId/edit', recordController.editRecord)
router.put('/records/:recordId', recordController.putRecord)
router.delete('/records/:recordId', recordController.deleteRecord)
router.get('/users/register', userController.registerPage)
router.get('/', recordController.getRecords)


module.exports = router