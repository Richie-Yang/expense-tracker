const express = require('express')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const app = express()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const usePassport = require('./config/passport')
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
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
usePassport(app)
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(flash())
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  next()
})
app.use(routes)


app.listen(PORT, () => {
  console.log(`Express server is listening at http://127.0.0.1:${PORT}`)
})