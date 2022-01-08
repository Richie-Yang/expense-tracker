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

const categorySchema = new Schema({
  icon: String,
  name: defaultSetup.stringType
})


module.exports = mongoose.model('Category', categorySchema)