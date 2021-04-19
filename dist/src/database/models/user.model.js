'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseEncryption = require('mongoose-encryption');

var _mongooseEncryption2 = _interopRequireDefault(_mongooseEncryption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;
var Model = _mongoose2.default.model;

var userSchema = new Schema({
    name: String,
    email: { type: String },
    password: String,
    role: Number,
    token: String,
    referral_code: String,
    country: String,
    where_from: String,
    remember_token: String,
    updated_at: String,
    openhumans_access_token: String,
    openhumans_refresh_token: String,
    openhumans_project_member_id: String,
    state: String,
    sqlId: String,
    user_type: String
});
userSchema.plugin(_mongooseEncryption2.default, { secret: process.env.APP_KEY, encryptedFields: ['country'] });
var User = Model('User', userSchema);
exports.default = User;