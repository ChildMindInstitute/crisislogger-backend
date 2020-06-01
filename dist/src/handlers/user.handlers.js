'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.userUpdateHandler = exports.userDeleteHandler = exports.getAllRecords = exports.userSignUpHandler = exports.userSignInHandler = undefined;

var _user = require('../database/services/user.service');

var _user2 = _interopRequireDefault(_user);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _user3 = require('../database/models/user.model');

var _user4 = _interopRequireDefault(_user3);

var _uploadTable = require('../database/services/uploadTable.service');

var _uploadTable2 = _interopRequireDefault(_uploadTable);

var _text = require('../database/services/text.service');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var uploadService = new _uploadTable2.default();
var textModelService = new _text2.default();
var userSignInHandler = exports.userSignInHandler = async function userSignInHandler(req, res) {
    try {
        var body = req.body;
        var userObject = await _user2.default.login(body.email);
        if (userObject === null) {
            return res.status(401).json({ message: "User doesn't exist" });
        }
        var isAuth = _bcrypt2.default.compareSync(body.password, userObject.password);
        var token = await _jsonwebtoken2.default.sign({ role: userObject.role, userObject: body.email }, process.env.SECRET_KEY);
        await _user2.default.updateToken(token);
        userObject.token = token;
        console.log(isAuth);
        if (isAuth) {
            return res.status(200).json({ user: userObject });
        } else {
            return res.status(401).json({ message: 'Auth wrong' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
};

var userSignUpHandler = exports.userSignUpHandler = async function userSignUpHandler(req, res) {
    res.set("Access-Control-Allow-Origin", "*");
    try {
        var body = req.body;
        body.password = await _bcrypt2.default.hashSync(body.password, 10);
        body.token = await _jsonwebtoken2.default.sign({ role: body.role, email: body.email }, process.env.SECRET_KEY);

        var user = await _user2.default.register(body);
        return res.status(200).json({ user: user });
    } catch (err) {
        if (err.name == 'MongoError') {
            return res.status(400).json({ message: 'The email address already exist', code: 1 });
        }
        return res.status(500).json({ message: err });
    }
};
var getAllRecords = exports.getAllRecords = async function getAllRecords(req, res) {
    try {
        var data = req.decoded;
        if (!data.userObject) {
            return res.status(401).json({ message: 'User information not found' });
        }
        var user = await _user2.default.login(data.userObject);
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }
        var uploads = await uploadService.getUserUploads(user._id);
        var texts = await textModelService.getUserTexts(user._id);

        return res.status(200).json({ records: { uploads: uploads, texts: texts } });
    } catch (err) {
        if (err.name == 'MongoError') {
            return res.status(400).json({ message: 'The email address already exist', code: 1 });
        }
        return res.status(500).json({ message: err });
    }
};
var userDeleteHandler = exports.userDeleteHandler = async function userDeleteHandler(req, res) {
    try {
        var id = req.params.id;
        await _user2.default.delete(id);
        return res.status(200).json();
    } catch (err) {
        return res.status(500).json();
    }
};

var userUpdateHandler = exports.userUpdateHandler = async function userUpdateHandler(req, res) {
    try {
        var id = req.params.id;
        var userObject = req.body;
        await _user2.default.update(id, userObject);
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false });
    }
};