const express = require('express')
const methodOverride = require('method-override')
const app = express()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const routes = require('./routes')
const { engine } = require('express-handlebars')
const PORT = process.env.PORT
require('./config/mongoose')

app.engine('hbs', engine({ 
  defaultLayout: 'main', 
  extname: '.hbs', 
  helpers: require('./config/handlebars')
}))
app.set('view engine', 'hbs')
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'))
app.use(routes)


app.listen(PORT, () => {
  console.log(`Express server is listening at http://127.0.0.1:${PORT}`)
})