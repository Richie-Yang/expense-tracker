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
const { serverError } = require('./middleware/errorHandler')
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
  res.locals.info_msg = req.flash('info_msg')
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.alert_msg = req.flash('alert_msg')
  next()
})
app.use(routes)
app.use((err, req, res, next) => {
  console.log(err.stack)
  return serverError(res)
})


app.listen(PORT, () => {
  console.log(`Express server is listening at http://127.0.0.1:${PORT}`)
})