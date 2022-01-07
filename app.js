const express = require('express')
const app = express()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { engine } = require('express-handlebars')
const PORT = process.env.PORT
require('./config/mongoose')

app.engine('hbs', engine({ 
  defaultLayout: 'main', 
  extname: '.hbs', 
  helpers: require('./config/handlebars')
}))
app.set('view engine', 'hbs')

app.use(express.static('public'))
require('./routes')(app)


app.listen(PORT, () => {
  console.log(`Express server is listening at http://127.0.0.1:${PORT}`)
})