const bcrypt = require('bcryptjs')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose')
const User = require('../user')
const Category = require('../category')
const Record = require('../record')
const { SEED_USERS, SEED_RECORDS, SEED_CATEGORIES } = require('../../dummyData.json')


db.once('open', async() => {
  try {
    const seedUsersLength = SEED_USERS.length
    const seedCategoriesLength = SEED_CATEGORIES.length
    const seedRecordsLength = SEED_RECORDS.length
    const conditionalArrayForRecord = []


    ////////////////// Remove Exist Seed Data In DB //////////////////
    await Promise.all(
      Array.from(Array(seedUsersLength), (_, i) => {
        return User.findOne({ name: SEED_USERS[i].name })
          .then(user => {
            if (!user) return

            conditionalArrayForRecord.push({ userId: user._id })
            return user.remove()
          })
      })
    )
    
    if (conditionalArrayForRecord.length) {
      const records = await Record.find({ $or: conditionalArrayForRecord })

      await Promise.all([
        Array.from(Array(records.length), (_, i) => {
          return records[i].remove()
        })
      ])
    }
    
    // console.log(mergedSeedData1)
    ////////////////// Remove Exist Seed Data In DB //////////////////



    ////////////////// Generate New Seed Data In DB //////////////////
    console.log('\nstart generating new seed categories in database')

    const mergedSeedData = await Promise.all([
      ...Array.from(Array(seedUsersLength), (_, i) => {
        const { name, email, password } = SEED_USERS[i]
        return bcrypt.genSalt(10)
          .then(salt => bcrypt.hash(password, salt))
          .then(hash => User.create({ 
            name, email, password: hash, isActive: true 
          }))
      }),
      ...Array.from(Array(seedCategoriesLength), (_, i) => {
        const { name } = SEED_CATEGORIES[i]
        return Category.findOne({ name })
      })
    ])

    await Promise.all(
      Array.from(Array(seedRecordsLength), (_, i) => {
        const { name, date, amount, userId, categoryId } = SEED_RECORDS[i]
        return Record.create({
          name, 
          date: new Date(date + " GMT+00:00"),
          amount,
          userId: mergedSeedData[userId - 1]._id,
          categoryId: mergedSeedData[categoryId + 1]._id
        })
      })
    )

    console.log('finish generating new seed categories in database\n')
    ////////////////// Generate New Seed Data In DB //////////////////



    console.log('done')
  } catch (err) {
    console.log(err)
  } finally {
    process.exit()
  }
})