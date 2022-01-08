module.exports = {
  ifCond: function (a, b, options) {
    a = typeof a === 'object' ? a.toString() : a
    b = typeof b === 'object' ? b.toString() : b
    
    return a === b ? 
      options.fn(this) : options.inverse(this)
  }
}