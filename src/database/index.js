import mongoose from 'mongoose'
const option = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(process.env.DATABASE_URL, option)

const db = mongoose.connection

db.on('error', err => {
    console.log('Error database connection: \n ', err)
})

db.on('open', () => {
    console.log('Database success connection')
})

export default db
