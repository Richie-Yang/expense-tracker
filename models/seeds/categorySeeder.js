if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose')
const Category = require('../category')
const { SEED_CATEGORIES } = require('../../dummyData.json')


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
        const { name, icon } = SEED_CATEGORIES[i]
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