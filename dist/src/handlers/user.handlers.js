'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.userUpdateHandler = exports.userDeleteHandler = exports.userSignUpHandler = exports.userSignInHandler = undefined;

var _user = require('../database/services/user.service');

var _user2 = _interopRequireDefault(_user);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _user3 = require('../database/models/user.model');

var _user4 = _interopRequireDefault(_user3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userSignInHandler = exports.userSignInHandler = async function userSignInHandler(req, res) {
    try {
        var body = req.body;
        var userObject = await _user2.default.login(body.email);
        var isAuth = _bcrypt2.default.compareSync(body.password, userObject.password);
        var token = await _jsonwebtoken2.default.sign({ role: userObject.role, userObject: body.email }, process.env.SECRET_KEY, { expiresIn: 60 * 60 });
        _user2.default.updateToken(token);
        isAuth ? res.status(200).json(token) : res.status(401).send('Auth wrong');
    } catch (err) {
        res.status(500).send(err);
    }
};

var userSignUpHandler = exports.userSignUpHandler = async function userSignUpHandler(req, res) {
    try {
        var body = req.body;
        body.password = await _bcrypt2.default.hashSync(body.password, 10);
        body.token = await _jsonwebtoken2.default.sign({ role: body.role, email: body.email }, process.env.SECRET_KEY, { expiresIn: 60 * 60 });
        await _user2.default.register(body);
        res.status(200).send(body.token);
    } catch (err) {
        if (err.name == 'MongoError') {
            res.status(400).send({ msg: 'Duplicate email', code: 1 });
        }
        res.status(500).send(err);
    }
};

var userDeleteHandler = exports.userDeleteHandler = async function userDeleteHandler(req, res) {
    try {
        var id = req.params.id;
        await _user2.default.delete(id);
        res.status(200).send();
    } catch (err) {
        res.status(500).send();
    }
};

var userUpdateHandler = exports.userUpdateHandler = async function userUpdateHandler(req, res) {
    try {
        var id = req.params.id;
        var userObject = req.body;
        await _user2.default.update(id, userObject);
        res.status(200).send();
    } catch (err) {
        res.status(500).send();
    }
};