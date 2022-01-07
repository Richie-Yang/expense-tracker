const recordController = require('../controllers/recordController')


module.exports = app => {
  app.use('/', recordController.getRecords)
}