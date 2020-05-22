import mongoose from 'mongoose'

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })

const db = mongoose.connection

db.on('error', err => {
    console.log('Error database connection: \n ', err)
})

db.on('open', () => {
    console.log('Database sucsses connection')
})

export default db
