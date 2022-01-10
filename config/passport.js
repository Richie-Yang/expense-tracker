const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('../models/user')


module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())

  
  passport.use(new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true }, 
    (req, email, password, done)  => {
      return User.findOne({ email })
        .then(user => {
          if (!user) {
            req.flash('warning_msg', '帳號或是密碼錯誤')
            return done(null, false)
          }

          return bcrypt.compare(password, user.password)
            .then(isMatch => {
              if (!isMatch) {
                req.flash('warning_msg', '帳號或是密碼錯誤')
                return done(null, false)
              }

              if (!user.isActive) {
                req.flash('warning_msg', '使用者尚未被認證')
                return done(null, false)
              }

              return done(null, user)
            })
        })
        .catch(err => done(err, false))
      }
    ))


  passport.serializeUser((user, done) => {
    return done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    return User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, false))
  })
}