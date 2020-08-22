import User from '../models/user.model'
const UserService = {
    async login(email) {
        let user;
        user = await User.findOne({email});
        return user;
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
        return User.findOne({email});
    }
}

export default UserService