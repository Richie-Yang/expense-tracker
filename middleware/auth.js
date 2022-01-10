module.exports = {
  authenticator: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/users/login')
    }
    next()
  }
}