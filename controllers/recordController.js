const moment = require('moment')
const Record = require('../models/record')
const Category = require('../models/category')
const { recordInputCheck } = require('../services/recordService')


module.exports = {
  getRecords: async (req, res, next) => {
    try {
      const userId = req.user._id
      const categoryId = req.query.category
      const timeRange = req.query.timeRange
      const sort = { _id: 'desc', date: 'desc' }
      const fromTimeArray = []
      const toTimeArray = []

      // find all categories and rearrange as new array
      const categories = await Category.find().lean()
      const categoryArray = categories.map(item => ({
        id: item._id,
        icon: item.icon
      }))

      if (timeRange) {
        const regexForFromTime = 
          /^(\d{4})\/?(\d{1,2})?\/?(\d{1,2})?\s?\-?\s?/g
        const regexForToTime =
          /\s\-\s(\d{4})?\/?(\d{1,2})?\/?(\d{1,2})?/g

        let m1, m2
        do {
          m1 = regexForFromTime.exec(timeRange)

          if (m1) {
            for (let i = 1; i < m1.length; i++) {
              fromTimeArray.push(m1[i])
            }
          }
        } while (m1)

        do {
          m2 = regexForToTime.exec(timeRange)

          if (m2) {
            for (let i = 1; i < m2.length; i++) {
              toTimeArray.push(m2[i])
            }
          }
        } while (m2)
      }


      const fromTime = moment(fromTimeArray).format()
      const toTime = moment(toTimeArray).format()

      // if categoryId is not selected or is selected as 'all'
      // just simply extract all record data from database
      // otherwise, extract data based on selected category
      const records = categoryId === undefined || categoryId === 'all' ?
        await Record.find({ $and: [{ userId }] }).lean().sort(sort) :
        await Record.find({ $and: [{ userId }, { categoryId }] }).lean().sort(sort)

      // reArrange records and insert both icon and date data
      records.forEach((item, index, array) => {
        categoryArray.forEach(categoryItem => {
          if (categoryItem.id.toString() === item.categoryId.toString()) {
            array[index].icon = categoryItem.icon
          }
        })
        array[index].date = moment(item.date).format('YYYY/MM/DD')
      })

      // calculate totalAmount
      let totalAmount = records.length ? 
        records.map(record => record.amount).reduce((x, y) => x + y) : 0
      
      // decimal adjustment for totalAmount before rendered on index page
      switch (true) {
        case (totalAmount >= 1_000_000_000):
          // can your money hit this mark? if so, send me some please XD
          totalAmount = (totalAmount / 1_000_000_000).toFixed(3) + 'B'
          break
        case (totalAmount >= 1_000_000):
          totalAmount = (totalAmount / 1_000_000).toFixed(3) + 'M'
          break
        case (totalAmount >= 1_000):
          totalAmount = (totalAmount / 1_000).toString() + 'K'
          break
      }

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

  postRecord: (req, res, next) => {
    const userId = req.user._id
    const { name, date, category, amount } = req.body


    return recordInputCheck('post', req)
      .then(result => {
        if (result !== 'allPass') {
          // if exists, we proceed to update record
          return res.render('new', result)
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
      .catch(err => next(err))
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

      // combine month, day, and year as one line string
      date = `${new Date(date).getFullYear()}-${month}-${day}`


      return res.render('new', {
        record, categories, 
        categoryId: record.categoryId, 
        name, date, amount 
      })
    } catch (err) { next(err) }
  },

  putRecord: (req, res, next) => {
    const userId = req.user._id
    const _id = req.params.recordId
    const { name, date, category, amount } = req.body


    return recordInputCheck('put', req)
      .then(result => {
        if (result !== 'allPass') {
          // if exists, we proceed to update record
          return res.render('new', result)
        }

        return Record.findOne({ _id, userId })
          .then(record => {
            record.name = name
            record.date = new Date(date + " GMT+00:00")
            record.amount = Number(amount)
            record.categoryId = category
            return record.save()
          })
          .then(() => {
            req.flash('success_msg', '紀錄已經成功修改')
            res.redirect('/')
          })
      })
      .catch(err => next(err))
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