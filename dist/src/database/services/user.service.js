'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserService = {
    login: function login(email) {
        return _user2.default.findOne({ email: email });
    },
    register: function register(userObj) {
        var user = new _user2.default(userObj);
        return user.save();
    },
    delete: function _delete(id) {
        return _user2.default.findOneAndDelete({ _id: id });
    },
    update: function update(id, updateObj) {
        return _user2.default.findOneAndUpdate({ _id: id }, updateObj);
    },
    updateToken: function updateToken(userId, token) {
        _user2.default.findOneAndUpdate({ _id: userId }, { token: token });
    }
};

exports.default = UserService;