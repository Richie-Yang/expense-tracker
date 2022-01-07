const Record = require('../models/record')
const Category = require('../models/category')


module.exports = {
  getRecords: async(req, res, next) => {
    try {
      const categories = await Category.find().lean()
      const records = await Record.find().lean()
      const totalAmount = records.map(record => record.amount)
        .reduce((x, y) => x + y)

      return res.render('index', { categories , totalAmount, records })
    } catch (err) { next(err) }
  }
}