const Record = require('../models/record')
const Category = require('../models/category')


module.exports = {
  getRecords: async(req, res, next) => {
    try {
      const categoryId = req.query.category
      const sort = { date: 'desc' }

      const categories = await Category.find().lean()
      const records = categoryId === undefined || categoryId === 'all' ?
        await Record.find().lean().sort(sort) :
        await Record.find({ categoryId }).lean().sort(sort)

      const totalAmount = records.length ? 
        records.map(record => record.amount).reduce((x, y) => x + y) : 0

      return res.render('index', { 
        categories, categoryId, totalAmount, records 
      })
    } catch (err) { next(err) }
  }
}