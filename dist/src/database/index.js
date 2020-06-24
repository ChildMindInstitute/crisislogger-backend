'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var option = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true
};
_mongoose2.default.connect(process.env.DATABASE_URL, option);

var db = _mongoose2.default.connection;

db.on('error', function (err) {
    console.log('Error database connection: \n ', err);
});

db.on('open', function () {
    console.log('Database success connection');
});

exports.default = db;