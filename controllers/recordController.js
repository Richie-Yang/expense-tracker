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
  },

  createRecord: (req, res, next) => {
    return Category.find()
      .lean()
      .then(categories => res.render('new', { categories }))
      .catch(err => next(err))
  },

  postRecord: async(req, res, next) => {
    try {
      const { name, date, category, amount } = req.body
      const categories = await Category.find().lean()
      let errors = ''

      if (!name.trim() || !date || !category || !amount) {
        errors += '所有欄位都是必填'
      }

      if (Number(amount) < 0) errors += '\n金額欄位不為負數'

      if (errors.length) {
        console.log(errors)
        return res.render('new', {
          errors, name, categories, amount
        })
      }

      return Category.findById(category)
        .then(category => {
          if (!category) {
            errors += '\n類別欄位並不存在'
            console.log(errors)
            return res.render('new', {
              errors, name, categories, amount
            })
          }

          return Record.create({
            name,
            date: new Date(date + " GMT+00:00"),
            amount: Number(amount),
            userId: "61d8473f79cc55019b5ee4c8",
            categoryId: category
          })
            .then(() => res.redirect('/'))
        })

    } catch (err) { next(err) }
  }
}