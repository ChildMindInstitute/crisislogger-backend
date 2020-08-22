'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserService = {
    login: async function login(email) {
        var user = void 0;
        user = await _user2.default.findOne({ email: email });
        return user;
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
        return _user2.default.findOne({ email: email });
    }
};

exports.default = UserService;