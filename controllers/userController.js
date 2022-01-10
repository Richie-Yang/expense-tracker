const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const moment = require('moment')
const User = require('../models/user')


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
})


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
              .then(user => {
                const validationSalt = bcrypt.genSaltSync(10)
                const validationHash = bcrypt.hashSync(
                  user._id.toString(), validationSalt
                )
                const validationCode = `${user._id}!${validationHash}`

                user.validationCode = validationCode
                user.validationTime = moment()
                return user.save()
              })
              .then(({ validationCode }) => {
                var mailOptions = {
                  from: process.env.LOCAL_EMAIL_SENDER,
                  to: email,
                  subject: `家庭記帳本 帳號認證`,
                  text: `請點擊以下的連結:\n
                ${process.env.LOCAL_CALLBACK_URL}?activate=${validationCode}
                `
                }

                return transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                })
              })

          })
          .then(() => {
            req.flash('info_msg', '認證信件已經寄到註冊信箱，請到信箱確認')
            res.redirect('/users/login')
          })
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
  },

  localCallback: (req, res, next) => {
    const validationCode = req.query.activate
    const userId = validationCode.split('!')[0]


    return User.findById(userId)
      .then(user => {
        if (validationCode !== user.validationCode) return

        const now = moment()
        const diff = now.diff(user.validationTime)
        const duration = moment.duration(diff)
        if (duration.asMinutes() > 5) {
          return
        }
        
        
        user.isActive = true
        return user.save()
      })
      .then(() => res.redirect('/users/login'))
      .catch(err => next(err))
  }
}