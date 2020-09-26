import User from '../models/user.model'
const UserService = {
    async login(email, host) {
        let users = await User.find();
      let user = users.filter(item => (item.email === email.trim() && item.host === host));
        return user.length ? user[0]: null;
    },
   async register(userObj) {
        const user = new User(userObj)
       return await user.save()
    },
    delete(id) {
        return User.findOneAndDelete({_id: id})
    },
    update(id, updateObj) {
        return User.findOneAndUpdate({_id: id}, updateObj)
    },
    updateToken(userId, token) {
        User.findOneAndUpdate({ _id: userId }, { token })
    },
    async getUserIdByEmail(email) {
        let users = await User.find();
        let user = users.filter(item => item.email === email.trim());
        return user.length ? user[0]: null;
    },
    async getUsersIdsLikeEmails(emails=[]){
        let ids =[]
        let users = await User.find()
        emails.forEach(email=>{
            ids = [...ids,...users.filter(user=>user.email.includes(email.trim())).map(e=>e._id)]
        })
        return ids
    },
    async getUserIdsFromRefferals(referrals=[]){
        let ids =[]
        let users = await User.find()
        referrals.forEach(referral=>{
            ids = [...ids,...users.filter(user=>user.referral_code === referral.trim()).map(e=>e._id)]
        })
        return ids
    },
    async getUserByEmail(email){
        const user = await User.find()
        return user[user.findIndex(el=>el.email === email)]
    }
}

export default UserService