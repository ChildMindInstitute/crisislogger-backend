'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var UserService = {
    login: async function login(email, host) {
        return _user2.default.findOne({ email: email, where_from: host });
    },
    register: async function register(userObj) {
        var user = new _user2.default(userObj);
        return await user.save();
    },
    delete: function _delete(id) {
        return _user2.default.findOneAndDelete({ _id: id });
    },
    update: function update(id, updateObj) {
        return _user2.default.findOneAndUpdate({ _id: id }, { $set: updateObj }, { useFindAndModify: false, new: true, returnOriginal: false });
    },
    updateToken: function updateToken(userId, token) {
        _user2.default.findOneAndUpdate({ _id: userId }, { token: token });
    },
    getUserIdByEmail: async function getUserIdByEmail(email, host) {
        var user = void 0;
        if (!host) {
            user = await _user2.default.findOne({ email: email });
        } else {
            user = await _user2.default.findOne({ email: email, where_from: host });
        }
        return user ? user._id : null;
    },
    getUsersIdsLikeEmails: async function getUsersIdsLikeEmails() {
        var emails = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var host = arguments[1];

        var ids = [];
        var users = await _user2.default.find();
        emails.forEach(function (email) {
            ids = [].concat(_toConsumableArray(ids), _toConsumableArray(users.filter(function (user) {
                return user.email.includes(email.trim()) && user.host === host;
            }).map(function (e) {
                return e._id;
            })));
        });
        return ids;
    },
    getUserIdsFromRefferals: async function getUserIdsFromRefferals() {
        var referrals = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var host = arguments[1];

        var ids = [];
        var users = await _user2.default.find();
        referrals.forEach(function (referral) {
            ids = [].concat(_toConsumableArray(ids), _toConsumableArray(users.filter(function (user) {
                return user.referral_code === referral.trim() && user.host === host;
            }).map(function (e) {
                return e._id;
            })));
        });
        return ids;
    },
    getUserByEmail: async function getUserByEmail(email, host) {
        if (!host) {
            return await _user2.default.findOne({ email: email });
        } else {
            return await _user2.default.findOne({ email: email, where_from: host });
        }
    }
};

exports.default = UserService;