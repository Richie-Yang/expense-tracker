const mongoose = require('mongoose')
const { Schema } = mongoose
const defaultSetup = require('./defaultSetup')


const recordSchema = new Schema({
  name: defaultSetup.stringType,
  date: defaultSetup.dateType,
  amount: defaultSetup.numberType,
  userId: { ...defaultSetup.refType, ref: 'User' },
  categoryId: { ...defaultSetup.refType, ref: 'Category' },
  updatedAt: { 
    ...defaultSetup.dateType,
    default: Date.now
  },
  createdAt: {
    ...defaultSetup.dateType,
    default: Date.now
  }
})


module.exports = mongoose.model('Record', recordSchema)