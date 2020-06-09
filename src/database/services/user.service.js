import User from '../models/user.model'

const UserService = {
    login(email) {
        return User.findOne({ email })
    },
    register(userObj) {
        const user = new User(userObj)
        return user.save()
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
    getUserIdByEmail(email) {
        return User.findOne({ email })
    }
}

export default UserService