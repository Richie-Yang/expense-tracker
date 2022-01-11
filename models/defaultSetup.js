const mongoose = require('mongoose')
const { Schema } = mongoose


module.exports = {
  stringType: {
    type: String,
    required: true
  },
  numberType: {
    type: Number,
    required: true
  },
  dateType: {
    type: Date,
    required: true,
  },
  refType: {
    type: Schema.Types.ObjectId,
    required: true
  }
}