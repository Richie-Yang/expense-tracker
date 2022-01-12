const Category = require('../models/category')


module.exports = {
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