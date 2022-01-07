module.exports = {
  ifCond: function (a, b, options) {
    a = typeof a === 'object' ? a.toString() : a
    
    return a === b ? 
      options.fn(this) : options.inverse(this)
  }
}