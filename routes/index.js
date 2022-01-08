const express = require('express')
const router = express.Router()
const recordController = require('../controllers/recordController')


router.get('/records/new', recordController.createRecord)
router.post('/records', recordController.postRecord)
router.get('/records/:recordId/edit', recordController.editRecord)
router.get('/', recordController.getRecords)


module.exports = router