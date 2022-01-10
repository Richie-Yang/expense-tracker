const User = require('../models/user')
const bcrypt = require('bcryptjs')
const user = require('../models/user')


module.exports = {
  registerPage: (req, res) => {
    res.render('register')
  },

  register: (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body
    const errors = []

    if (!email || !password || !confirmPassword) {
      errors.push({ message: '所有欄位都是必填' })
    }

    if (password !== confirmPassword) {
      errors.push({ message: '密碼欄位需要一致' })
    }

    if (errors.length) {
      console.log(errors)
      return res.render('register', {
        errors, name, email
      })
    }

    return User.findOne({ email })
      .then(user => {
        if (user) {
          errors.push({ message: '電子信箱已被使用' })
          console.log(errors)
          return res.render('register', {
            errors, name, email
          })
        }

        return bcrypt.genSalt(10)
          .then(salt => bcrypt.hash(password, salt))
          .then(hash => {
            return User.create({
              name, email, password: hash
            })
          })
          .then(() => res.redirect('/users/login'))
      })
    .catch(err => next(err))
  },

  loginPage: (req, res) => {
    res.render('login')
  },

  login: (req, res) => {
    res.redirect('/')
  },

  logout: (req, res) => {
    req.logout()
    return res.redirect('/users/login')
  }
}