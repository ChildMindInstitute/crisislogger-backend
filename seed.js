require('dotenv').config()
const mongoose = require("mongoose");
const bcrypt  = require('bcrypt')
const JWT  = require('jsonwebtoken')
const encrypt = require('mongoose-encryption')

let Schema = mongoose.Schema
let Model = mongoose.model
const userSchema = new Schema({
    name: String,
    email: { type: String },
    password: String,
    role: Number,
    token: String,
    referral_code: String,
    country : String,
    where_from: String,
    remember_token:String,
    updated_at:String,
    openhumans_access_token:String,
    openhumans_refresh_token:String,
    openhumans_project_member_id:String,
    state:String,
    sqlId:String,
    user_type: String
})
userSchema.plugin(encrypt,{ secret: process.env.APP_KEY, encryptedFields: ['country'] });
const User =  Model('User', userSchema)
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
    seed()
    
})
const seed=async()=>{
    let object = {
        name:"Admin",
        email:"admin@crisislogger.org",
        password:"baskin@Robins_101",
        role:2,
        where_from:"main.crisislogger.org"
    }
    try{
        object.password = await bcrypt.hashSync(object.password, 10)
        object.token = await JWT.sign({host:object.host,role: object.role, email: object.email}, process.env.SECRET_KEY)
        let user = new User(object)
        user  = await user.save()
        if(user){
            console.log(user)
            db.close()
        }
    }catch(error){
        console.log(error)
    }
}