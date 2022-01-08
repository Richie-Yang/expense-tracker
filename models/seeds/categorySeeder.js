if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose')
const Category = require('../category')
const { SEED_CATEGORIES } = require('../../dummyData.json')

const CATEGORY = {
  家居物業: "https://fontawesome.com/icons/home?style=solid",
  交通出行: "https://fontawesome.com/icons/shuttle-van?style=solid",
  休閒娛樂: "https://fontawesome.com/icons/grin-beam?style=solid",
  餐飲食品: "https://fontawesome.com/icons/utensils?style=solid",
  其他: "https://fontawesome.com/icons/pen?style=solid"
}


db.once('open', async() => {
  try {
    ////////////////// Remove Exist Seed Data In DB //////////////////
    console.log('\nstart removing exist seed categories in database')
    await Promise.all(
      Array.from(Array(SEED_CATEGORIES.length), (_, i) => {
        const { name } = SEED_CATEGORIES[i]
        return Category.findOne({ name })
          .then(category => {
            if (category) return category.remove()
          })
      })
    ).then(() => {
      console.log('finish removing new seed categories in database\n')
    })
    ////////////////// Remove Exist Seed Data In DB //////////////////



    ////////////////// Generate New Seed Data In DB //////////////////
    console.log('\nstart generating new seed categories in database')
    await Promise.all(
      Array.from(Array(SEED_CATEGORIES.length), (_, i) => {
        const { name } = SEED_CATEGORIES[i]
        let icon = ''

        for (let item in CATEGORY) {
          if (item === name) icon = CATEGORY[item]
          console.log(icon)
        }

        return Category.create({ icon, name })
      })
    ).then(() => {
      console.log('finish generating new seed categories in database\n')
    })
  ////////////////// Generate New Seed Data In DB //////////////////



    console.log('done')
  } catch (err) {
    console.log(err)
  } finally {
    process.exit()
  }
})