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

// set handlebars as template engine
app.engine('hbs', engine({ 
  defaultLayout: 'main', 
  extname: '.hbs', 
  helpers: require('./config/handlebars')
}))
app.set('view engine', 'hbs')


////////// route section starts here //////////
// use express-session module
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))

// use passport module
usePassport(app)
// use method-override module
app.use(methodOverride('_method'))
// use built-in body-parser module
app.use(express.urlencoded({ extended: true }))
// use static routing
app.use(express.static('public'))
// use connect-flash module
app.use(flash())
// use custom middleware to preload req data into res
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
// use custom middleware to deal with error exception
app.use((err, req, res, next) => {
  console.log(err.stack)
  return serverError(res)
})
////////// route section ends here //////////


app.listen(PORT, () => {
  console.log(`Express server is listening at http://127.0.0.1:${PORT}`)
})