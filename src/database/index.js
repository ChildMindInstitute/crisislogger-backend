import mongoose from 'mongoose'
import migrateDb from "../../migrate";
const option = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    useNewUrlParser: true,
    useFindAndModify:true,
    useUnifiedTopology: true
};
mongoose.connect(process.env.DATABASE_URL, option)

const db = mongoose.connection

db.on('error', err => {
    console.log('Error database connection: \n ', err)
})

db.on('open', () => {
    console.log('Database success connection')
    console.log(process.env.MIGRATE_DB)
    if(process.env.MIGRATE_DB == 1){
        migrateDb();
    }
})

export default db
