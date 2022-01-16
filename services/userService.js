const bcrypt = require('bcryptjs')
const moment = require('moment')
const User = require('../models/user')
const transporter = require('../config/nodemailer')


module.exports = {
  verifyEmailSent: async(req) => {
    const userId = req.user._id.toString()

    // in order to make verification email
    // we set some attributes to user in database
    // then also create validationCode from userId

    // every time you hit send verification email link
    // we regenerate new code and record the current time
    const user = await User.findById(userId)
    const validationSalt = await bcrypt.genSaltSync(3)
    const validationHash = await bcrypt.hashSync(
      user._id.toString(), validationSalt
    )
    const validationCode = `${user._id}!${validationHash}`
    // set validationCode for verification link check later
    user.validationCode = validationCode
    // set validationTime to prevent link works forever
    user.validationTime = moment()
    await user.save()

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

      return 'email sent'
    })
  }
}