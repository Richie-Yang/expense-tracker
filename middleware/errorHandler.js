module.exports = {
  serverError: (res) => {
    const statusCode = 500
    return res.status(statusCode).render('error', {
      statusCode,
      message: '系統出錯，稍後再試，或是點擊下方按鈕返回首頁'
    })
  }
}