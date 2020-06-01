'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;
var Model = _mongoose2.default.model;

var userSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: Number,
    token: String,
    referral_code: String,
    country: String,
    uploads: [{
        type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Uploads'
    }],
    texts: [{
        type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Text'
    }]
});

var User = Model('User', userSchema);

exports.default = User;