import User from '../models/user.model'

const UserService = {
    async login(email, host) {
      return await User.find({email: email, where_from: host});
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
    async getUserIdByEmail(email, host) {
      let user;
      if (!host)
      {
        user =  await User.find({email: email});
      }
      else {
        user = await User.find({email: email, where_from: host});
      }
      return user?user._id: null;
    },
    async getUsersIdsLikeEmails(emails=[], host){
        let ids =[]
        let users = await User.find()
        emails.forEach(email=>{
            ids = [...ids,...users.filter(user=>user.email.includes(email.trim()) && user.host === host).map(e=>e._id)]
        })
        return ids
    },
    async getUserIdsFromRefferals(referrals=[], host){
        let ids =[]
        let users = await User.find()
        referrals.forEach(referral=>{
            ids = [...ids,...users.filter(user=>user.referral_code === referral.trim() && user.host === host).map(e=>e._id)]
        })
        return ids
    },
    async getUserByEmail(email, host){
      if (!host)
      {
        return await User.find({email: email});
      }
      else {
        return await User.find({email: email, where_from: host});
      }
    }
}

export default UserService