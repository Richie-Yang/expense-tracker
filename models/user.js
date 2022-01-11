const mongoose = require('mongoose')
const { Schema } = mongoose
const defaultSetup = require('./defaultSetup')


const userSchema = new Schema({
  name: defaultSetup.stringType,
  email: defaultSetup.stringType,
  password: defaultSetup.stringType,
  validationCode: String,
  validationTime: Date,
  isActive: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    ...defaultSetup.dateType,
    default: Date.now
  },
  createdAt: {
    ...defaultSetup.dateType,
    default: Date.now
  }
})


module.exports = mongoose.model('User', userSchema)