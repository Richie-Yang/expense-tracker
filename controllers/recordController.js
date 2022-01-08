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
      .then(categories => res.render('new', {
        createRecord: true,
        categories 
      }))
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
          errors, name, date, categories, 
          categoryId: category,
          amount
        })
      }

      return Category.findById(category)
        .then(category => {
          if (!category) {
            errors += '\n類別欄位並不存在'
            console.log(errors)
            return res.render('new', {
              errors, name, date, categories, 
              categoryId: category,
              amount
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
  },

  editRecord: async(req, res, next) => {
    try {
      const { recordId } = req.params

      const categories = await Category.find().lean()
      const record = await Record.findById(recordId).lean()
      const { name, amount } = record
      let { date } = record

      // convert date data to make it compatible for front-end
      let month = (new Date(date).getMonth() + 1).toString()
      month = month.length < 2 ? `0${month}` : month

      let day = new Date(date).getDate().toString()
      day = day.length < 2 ? `0${day}` : day

      date = `${new Date(date).getFullYear()}-${month}-${day}`


      return res.render('new', {
        categories, 
        categoryId: record.categoryId, 
        name, date, amount 
      })
    } catch (err) { next(err) }
  }
}