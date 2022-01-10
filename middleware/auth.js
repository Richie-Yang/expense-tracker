module.exports = {
  authenticator: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/users/login')
    }

    const { user } = req
    if (!user.isActive) {
      return res.render('verify', {
        user,
        status: '尚未認證:',
        message: '在使用本網頁服務之前，請先認證您的電子信箱'
      })
    }
    
    next()
  }
}