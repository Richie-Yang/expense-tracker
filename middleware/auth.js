module.exports = {
  authenticatedCheck: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/users/login')
    }

    if (req.user.isActive) {
      return res.redirect('/')
    }

    next()
  },

  authenticator: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/users/login')
    }

    if (!req.user.isActive) {
      return res.redirect('/auth/local/page')
    }

    next()
  }
}