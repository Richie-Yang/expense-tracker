const express = require('express')
const router = express.Router()
const recordController = require('../controllers/recordController')


router.use('/records/new', recordController.createRecord)
router.use('/', recordController.getRecords)


module.exports = router