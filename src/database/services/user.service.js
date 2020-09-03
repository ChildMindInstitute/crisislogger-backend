import User from '../models/user.model'
const UserService = {
    async login(email) {
        let users = await User.find();
        let user = users.filter(item => item.email === email.trim());
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
    }
}

export default UserService