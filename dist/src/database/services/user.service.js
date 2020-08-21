'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _Encrypter = require('../../api/Encrypter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserService = {
    login: async function login(email) {
        var user = await _user2.default.findOne({ email: email });
        user.name = (0, _Encrypter.decrypt)(user.name);
        return user;
    },
    register: async function register(userObj) {
        userObj.name = (0, _Encrypter.encrypt)(userObj.name);
        var user = new _user2.default(userObj);
        var savedUser = await user.save();
        savedUser.name = (0, _Encrypter.decrypt)(savedUser.name);
        return savedUser;
    },
    delete: function _delete(id) {
        return _user2.default.findOneAndDelete({ _id: id });
    },
    update: function update(id, updateObj) {
        updateObj.name = (0, _Encrypter.encrypt)(updateObj.name);
        return _user2.default.findOneAndUpdate({ _id: id }, updateObj);
    },
    updateToken: function updateToken(userId, token) {
        _user2.default.findOneAndUpdate({ _id: userId }, { token: token });
    },
    getUserIdByEmail: async function getUserIdByEmail(email) {
        var user = await _user2.default.findOne({ email: email });
        user.name = (0, _Encrypter.decrypt)(user.name);
        return user;
    }
};

exports.default = UserService;