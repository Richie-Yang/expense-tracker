const mongoose = require('mongoose')
const { Schema } = mongoose
const defaultSetup = require('./defaultSetup')


const categorySchema = new Schema({
  icon: String,
  name: defaultSetup.stringType,
  updatedAt: {
    ...defaultSetup.dateType,
    default: Date.now
  },
  createdAt: {
    ...defaultSetup.dateType,
    default: Date.now
  }
})


module.exports = mongoose.model('Category', categorySchema)