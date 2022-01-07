const app = require('express')()

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { engine } = require('express-handlebars')
const PORT = process.env.PORT

app.engine('hbs', engine({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

require('./routes')(app)


app.listen(PORT, () => {
  console.log(`Express server is listening at http://127.0.0.1:${PORT}`)
})