const User = require('../models/user')
const bcrypt = require('bcryptjs')


module.exports = {
  registerPage: (req, res) => {
    res.render('register')
  },

  register: (req, res, next) => {
    const { email, password, confirmPassword } = req.body
    let { name } = req.body
    const errors = []

    if (!email || !password || !confirmPassword) {
      errors.push({ message: '所有欄位都是必填' })
    }

    if (password !== confirmPassword) {
      errors.push({ message: '密碼欄位需要一致' })
    }

    if (errors.length) {
      return res.render('register', {
        errors, name, email
      })
    }

    return User.findOne({ email })
      .then(user => {
        if (user) {
          errors.push({ message: '電子信箱已被使用' })
          return res.render('register', {
            errors, name, email
          })
        }

        return bcrypt.genSalt(10)
          .then(salt => bcrypt.hash(password, salt))
          .then(hash => {
            if (!name) name = email.split('@')[0]

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
    const { name } = req.user
    req.flash('success_msg', `歡迎回來，${name}`)
    res.redirect('/')
  },

  logout: (req, res) => {
    req.flash('success_msg', '您已成功登出')
    req.logout()
    return res.redirect('/users/login')
  }
}