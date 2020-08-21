import User from '../models/user.model'
import {encrypt, decrypt} from '../../api/Encrypter';
const UserService = {
    async login(email) {
        let user = await User.findOne({ email });
        user.name = decrypt(user.name)
        return user;
    },
   async register(userObj) {
        userObj.name = encrypt(userObj.name);
        const user = new User(userObj)
        let savedUser = await user.save()
        savedUser.name = decrypt(savedUser.name)
        return savedUser
    },
    delete(id) {
        return User.findOneAndDelete({_id: id})
    },
    update(id, updateObj) {
        updateObj.name = encrypt(updateObj.name);
        return User.findOneAndUpdate({_id: id}, updateObj)
    },
    updateToken(userId, token) {
        User.findOneAndUpdate({ _id: userId }, { token })
    },
    async getUserIdByEmail(email) {
        let user = await User.findOne({ email });
        user.name = decrypt(user.name)
        return user
    }
}

export default UserService