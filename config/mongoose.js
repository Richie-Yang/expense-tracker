const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI)
const db = mongoose.connection


db.on('error', () => console.error('mongodb error!'))
db.once('open', () => console.log('mongodb connected!'))


module.exports = db