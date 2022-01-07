const mongoose = require('mongoose')
const { Schema } = mongoose

const defaultSetup = {
  stringType: {
    type: String,
    required: true
  },
  dateType: {
    type: Date,
    required: true,
  }
}

const userSchema = new Schema({
  name: defaultSetup.stringType,
  createdAt: {
    ...defaultSetup.dateType,
    default: Date.now
  }
})


module.exports = mongoose.model('User', userSchema)