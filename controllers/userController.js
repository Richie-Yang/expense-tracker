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
              .then(() => {
                req.flash('success_msg', '帳號已經註冊成功')
                return res.redirect(`/users/login`)
              })
          })
      })
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
        if (!user) return res.redirect('/users/login')

        if (validationCode !== user.validationCode) return user

        const now = moment()
        const diff = now.diff(user.validationTime)
        const duration = moment.duration(diff)
        if (duration.asMinutes() > 5) return user
        
        user.isActive = true
        return user.save()
      })
      .then(user => {
        
        if (user) {
          const userObj = { _id: user._id, isActive: user.isActive }

          if (!userObj.isActive) {
            return res.render('verify', {
              user: userObj,
              status: '認證失敗:',
              message: '認證連結已經過期，請再重新發送認證信件'
            })
          }

          req.flash('success_msg', '電子信箱已經成功認證，請再重新登入')
        } else {
          req.flash('warning_msg', '連結失效，請再重新註冊帳號')
        }

        return res.redirect(`/users/login`)
      })
      .catch(err => next(err))
  },

  verify: async(req, res, next) => {
    try {
      const { userId } = req.params

      const user = await User.findById(userId)
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

      var mailOptions = {
        from: process.env.LOCAL_EMAIL_SENDER,
        to: user.email,
        subject: `家庭記帳本 帳號認證`,
        text: `請點擊以下的連結:\n${process.env.LOCAL_CALLBACK_URL}?activate=${user.validationCode}`
      }

      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error)
        } else {
          console.log('Email sent: ' + info.response)
        }

        const userObj = { _id: user._id }

        return res.render('verify', {
          user: userObj,
          status: '尚未認證:',
          message: '認證信件已經發送，請到註冊信箱確認是否收到'
        })
      })
    } catch (err) { next(err) }
  }
}