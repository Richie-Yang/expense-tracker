const bcrypt = require('bcryptjs')
const moment = require('moment')
const User = require('../models/user')
const transporter = require('../config/nodemailer')


module.exports = {
  registerPage: (req, res) => {
    res.render('register')
  },

  register: async(req, res, next) => {
    try {
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

      // check user exists or not based on email
      const user = await User.findOne({ email })
        .then(user => {

          // user is found, but it's not verified yet
          if (user) {
            if (!user.isActive) {
              const now = moment()
              const diff = now.diff(user.createdAt)
              const duration = moment.duration(diff)

              // if user does not verify within 60 mins
              // then we automatically delete that account
              if (duration.asMinutes() > 60) {
                user.remove()
                return null
              }
            }

            return user
          }
        })

      // check user exists or not based on previous return
      if (!user) {
        // if not, we create new account for the user
        return bcrypt.genSalt(10)
          .then(salt => bcrypt.hash(password, salt))
          .then(hash => {
            // if user has name set, we create one
            if (!name) name = email.split('@')[0]

            return User.create({
              name, email, password: hash
            })
              .then(() => {
                req.flash('success_msg', '帳號已經註冊成功')
                return res.redirect(`/users/login`)
              })
          })
      } 

      // if yes, we remind user to use another email account
      errors.push({ message: '電子信箱已被使用' })
      return res.render('register', {
        errors, name, email
      })

    } catch (err) { next(err) }
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

  localCallback: async (req, res, next) => {
    try {
      // extract queryString from HTTP request
      // and we get both userId and validationCode
      const validationCode = req.query.activate
      const userId = validationCode.split('!')[0]

      // check if user can be found with userId
      const user = await User.findById(userId)
        .then(user => {
          // if user not found, just redirect back to login page
          if (!user) return null

          // if validationCodes are matched, return user object
          if (validationCode !== user.validationCode) {
            return { isActive: false }
          }

          const now = moment()
          const diff = now.diff(user.validationTime)
          const duration = moment.duration(diff)
          // if validationCodes are matched, return user object
          if (duration.asMinutes() > 5) {
            return { isActive: false }
          }

          // if everything correct, just activate the user
          user.isActive = true
          return user.save()
        })

      // if not user is found, do the following 
      if (!user) {
        req.flash('warning_msg', '連結失效，請再重新註冊帳號')
        return res.redirect('/users/login')
      }

      // if user is not verified yet, do the following 
      if (!user.isActive) {
        req.flash('alert_msg', '認證連結已經過期，請再重新發送認證信件')
        return res.redirect('/auth/local/page')
      }

      // if everything is correct, do the following 
      req.flash('success_msg', '電子信箱已經成功認證，請再重新登入')
      return res.redirect(`/users/login`)
    } catch (err) { next(err) }
  },

  verifyPage: (req, res) => {
    res.render('verify')
  },

  verify: async(req, res, next) => {
    try {
      const userId = req.user._id.toString()

      // in order to make verification email
      // we set some attributes to user in database
      // then also create validationCode from userId

      // every time you hit send verification email link
      // we regenerate new code and record the current time
      const user = await User.findById(userId)
        .then(user => {
          const validationSalt = bcrypt.genSaltSync(3)
          const validationHash = bcrypt.hashSync(
            user._id.toString(), validationSalt
          )
          const validationCode = `${user._id}!${validationHash}`

          // set validationCode for verification link check later
          user.validationCode = validationCode
          // set validationTime to prevent link works forever
          user.validationTime = moment()
          return user.save()
        })

      // set email content here
      const mailOptions = {
        to: user.email,
        subject: `家庭記帳本 帳號認證`,
        text: `請點擊以下的連結:\n${process.env.LOCAL_CALLBACK_URL}?activate=${user.validationCode}`
      }

      // using nodemailer to send verification email to the user
      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error)
        } else {
          console.log('Email sent: ' + info.response)
        }

        // whatever the result, just redirect back to verify page
        req.flash('success_msg', '認證信件已經發送，請到註冊信箱確認是否收到')
        return res.redirect('/auth/local/page')
      })
    } catch (err) { next(err) }
  }
}