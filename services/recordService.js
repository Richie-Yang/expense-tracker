const moment = require('moment')
const Category = require('../models/category')


module.exports = {
  timeQueryParsing: (timeRange) => {
    const fromTimeArray = []
    const toTimeArray = []

    // if timeRange argument has value, start parsing
    if (timeRange) {
      // timeRange parsing process starts here
      // defining regex rule for both fromTime and toTime
      const regexForFromTime =
        /^(\d{4})\/?(\d{1,2})?\/?(\d{1,2})?\s?\-?\s?/g
      const regexForToTime =
        /\s\-\s(\d{4})?\/?(\d{1,2})?\/?(\d{1,2})?/g

      let m1, m2
      // parsing for fromTime
      do {
        m1 = regexForFromTime.exec(timeRange)

        if (m1) {
          for (let i = 1; i < m1.length; i++) {
            if (m1[i] === undefined) break
            fromTimeArray.push(Number(m1[i]))
          }
        }
      } while (m1)

      // parsing for toTime
      do {
        m2 = regexForToTime.exec(timeRange)

        if (m2) {
          for (let i = 1; i < m2.length; i++) {
            if (m2[i] === undefined) break
            toTimeArray.push(Number(m2[i]))
          }
        }
      } while (m2)
      // timeRange parsing process ends here
    }

    return timeObj = { fromTimeArray, toTimeArray }
  },

  timeQueryConvert: (timeObj) => {
    const { fromTimeArray, toTimeArray } = timeObj

    // if toTimeArray is empty, mirror from fromTimeArray
    if (!toTimeArray.length) {
      fromTimeArray.forEach((item, index) => {
        if (index === fromTimeArray.length - 1) {

          switch (true) {
            // if source month is 12
            // set destination year to next year
            // set destination month to 1
            case (index === 1 && item === 12):
              toTimeArray[0]++
              item = 1
              break

            // if source day is 31
            // set destination day to 1
            // set destination month to next month
            // if month is 13, then set year to next      
            case (index === 2 && item === 31):
              toTimeArray[1]++
              if (toTimeArray[1] > 12) {
                toTimeArray[0]++
                toTimeArray[1] = 1
              }
              item = 1
              break

            // default behavior
            default:
              item++
          }
        }

        toTimeArray.push(item)
      })
    }

    // if parsing works, then convert to Date object
    // otherwise use default time range instead
    const fromTime = fromTimeArray.length ?
      new Date(fromTimeArray) : new Date([1970, 1, 1])
    const toTime = toTimeArray.length ?
      new Date(toTimeArray) : new Date(moment().format())

    // return query filtering option for mongoose
    return { $gte: fromTime, $lte: toTime }
  },

  recordInputCheck: async(method, req) => {
    try {
      const _id = req.params.recordId
      const { name, date, category, amount } = req.body
      const categories = await Category.find().lean()
      const errors = []
      const errorObj = {
        errors, name, date, categories,
        categoryId: category,
        amount
      }

      if (method === 'post') errorObj.createRecord = true
      if (method === 'put') errorObj.record = { _id }

      // form input pre-check, all fields are required
      if (!name.trim() || !date || !category || !amount) {
        errors.push({ message: '所有欄位都是必填' })
      }

      // amount field can't be negative
      if (Number(amount) < 0) {
        errors.push({ message: '金額欄位不為負數' })
      }

      // if any error occurs, return error object
      if (errors.length) return errorObj

      // check if category exists or not
      const categoryIdArray = categories.map(item => item._id.toString())
      if (!categoryIdArray.includes(category)) {
        errors.push({ message: '類別欄位並不存在' })
        return errorObj
      }

      // otherwise, return 'allPass' string
      return 'allPass'

    } catch (err) { return error }
  }
}