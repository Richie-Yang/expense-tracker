const Record = require('../models/record')
const Category = require('../models/category')


module.exports = {
  getRecords: async(req, res, next) => {
    try {
      const categories = await Category.find().lean()
      const records = await Record.find().lean()

      return res.render('index', { categories ,records })
    } catch (err) { next(err) }
  }
}