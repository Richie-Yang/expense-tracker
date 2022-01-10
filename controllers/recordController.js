const moment = require('moment')
const Record = require('../models/record')
const Category = require('../models/category')


module.exports = {
  getRecords: async (req, res, next) => {
    try {
      const userId = req.user._id
      const categoryId = req.query.category
      const sort = { _id: 'desc', date: 'desc' }

      const categories = await Category.find().lean()
      const categoryArray = categories.map(item => ({
        id: item._id,
        icon: item.icon
      }))

      const records = categoryId === undefined || categoryId === 'all' ?
        await Record.find({ userId }).lean().sort(sort) :
        await Record.find({ userId, categoryId }).lean().sort(sort)

      records.forEach((item, index, array) => {
        categoryArray.forEach(categoryItem => {
          if (categoryItem.id.toString() === item.categoryId.toString()) {
            array[index].icon = categoryItem.icon
          }
        })
        array[index].date = moment(item.date).format('YYYY/MM/DD')
      })


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

  postRecord: async (req, res, next) => {
    try {
      const userId = req.user._id
      const { name, date, category, amount } = req.body
      const categories = await Category.find().lean()
      const errors = []

      if (!name.trim() || !date || !category || !amount) {
        errors.push({ message: '所有欄位都是必填' })
      }

      if (Number(amount) < 0) {
        errors.push({ message: '金額欄位不為負數' })
      }

      if (errors.length) {
        return res.render('new', {
          createRecord: true,
          errors, name, date, categories, 
          categoryId: category,
          amount
        })
      }

      return Category.findById(category)
        .then(category => {
          if (!category) {
            errors.push({ message: '類別欄位並不存在' })
            return res.render('new', {
              createRecord: true,
              errors, name, date, categories, 
              categoryId: category,
              amount
            })
          }

          return Record.create({
            name,
            date: new Date(date + " GMT+00:00"),
            amount: Number(amount),
            userId,
            categoryId: category
          })
            .then(() => {
              req.flash('success_msg', '紀錄已經成功建立')
              res.redirect('/')
            })
        })

    } catch (err) { next(err) }
  },

  editRecord: async (req, res, next) => {
    try {
      const userId = req.user._id
      const _id = req.params.recordId

      const categories = await Category.find().lean()
      const record = await Record.findOne({ _id, userId }).lean()
      const { name, amount } = record
      let { date } = record

      // convert date data to make it compatible for front-end
      let month = (new Date(date).getMonth() + 1).toString()
      month = month.length < 2 ? `0${month}` : month

      let day = new Date(date).getDate().toString()
      day = day.length < 2 ? `0${day}` : day

      date = `${new Date(date).getFullYear()}-${month}-${day}`


      return res.render('new', {
        record, categories, 
        categoryId: record.categoryId, 
        name, date, amount 
      })
    } catch (err) { next(err) }
  },

  putRecord: async (req, res, next) => {
    try {
      const userId = req.user._id
      const _id = req.params.recordId
      const { name, date, category, amount } = req.body
      const categories = await Category.find().lean()
      const errors = []

      if (!name.trim() || !date || !category || !amount) {
        errors.push({ message: '所有欄位都是必填' })
      }

      if (Number(amount) < 0) {
        errors.push({ message: '金額欄位不為負數' })
      }

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
            errors.push({ message: '類別欄位並不存在' })
            return res.render('new', {
              errors, name, date, categories,
              categoryId: category,
              amount
            })
          }

          return Record.findOne({ _id, userId })
            .then(record => {
              record.name = name
              record.date = new Date(date + " GMT+00:00")
              record.amount = Number(amount)
              record.categoryId = category
              record.save()
            })
            .then(() => {
              req.flash('success_msg', '紀錄已經成功修改')
              res.redirect('/')
            })
        })

    } catch (err) { next(err) }
  },

  deleteRecord: (req, res, next) => {
    const userId = req.user._id
    const _id = req.params.recordId
    
    return Record.findOne({ _id, userId })
      .then(record => record.remove())
      .then(() => {
        req.flash('success_msg', '紀錄已經成功刪除')
        res.redirect('/')
      })
      .catch(err => next(err))
  }
}