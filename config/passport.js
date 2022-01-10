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
    if (!email || !password) {
      return done(null, false, '信箱以及密碼都是必填欄位')
    }
    
    return User.findOne({ email })
      .then(user => {
        if (!user) {
          return done(null, false, '帳號或是密碼錯誤')
        }

        return bcrypt.compare(password, user.password)
          .then(isMatch => {
            if (!isMatch) {
              return done(null, false, '帳號或是密碼錯誤')
            }

            return done(null, user)
          })
      })
      .catch(err => done(err, false))
  }))


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