const sortBar = document.querySelector('#sort-bar')
const functionSubmitButton = document.querySelector('#function-submit-button')


sortBar.addEventListener('change', function onSortBarSelected() {
  functionSubmitButton.click()
})