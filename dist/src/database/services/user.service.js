'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserService = {
    login: async function login(email) {
        var users = await _user2.default.find();
        console.log(users);
        var user = users.filter(function (item) {
            return item.email === email.trim();
        });
        return user.length ? user[0] : null;
    },
    register: async function register(userObj) {
        var user = new _user2.default(userObj);
        return await user.save();
    },
    delete: function _delete(id) {
        return _user2.default.findOneAndDelete({ _id: id });
    },
    update: function update(id, updateObj) {
        return _user2.default.findOneAndUpdate({ _id: id }, updateObj);
    },
    updateToken: function updateToken(userId, token) {
        _user2.default.findOneAndUpdate({ _id: userId }, { token: token });
    },
    getUserIdByEmail: async function getUserIdByEmail(email) {
        var users = await _user2.default.find();
        var user = users.filter(function (item) {
            return item.email === email.trim();
        });
        return user.length ? user[0] : null;
    }
};

exports.default = UserService;