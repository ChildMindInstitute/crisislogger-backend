'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.saveUserQuestionnaire = exports.changePassword = exports.getAccount = exports.userUpdateHandler = exports.removeRecordsHandler = exports.userDeleteHandler = exports.changeRecordStatus = exports.getAllRecords = exports.userSignUpHandler = exports.userSignInHandler = undefined;

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

var _transcription = require('../database/services/transcription.service');

var _transcription2 = _interopRequireDefault(_transcription);

var _questionnary = require('../database/services/questionnary.service');

var _questionnary2 = _interopRequireDefault(_questionnary);

var _text = require('../database/services/text.service');

var _text2 = _interopRequireDefault(_text);

var _uploadTable3 = require('../database/models/uploadTable.model');

var _uploadTable4 = _interopRequireDefault(_uploadTable3);

var _text3 = require('../database/models/text.model');

var _text4 = _interopRequireDefault(_text3);

var _transcription3 = require('../database/models/transcription.model');

var _transcription4 = _interopRequireDefault(_transcription3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var uploadService = new _uploadTable2.default();
var textModelService = new _text2.default();
var transcriptService = new _transcription2.default();
var questionnaryService = new _questionnary2.default();

var userSignInHandler = exports.userSignInHandler = async function userSignInHandler(req, res) {
    try {
        var body = req.body;
        var userObject = await _user2.default.login(body.email);
        if (userObject === null) {
            return res.status(401).json({ message: "User doesn't exist" });
        }
        var isAuth = _bcrypt2.default.compareSync(body.password, userObject.password);
        var token = await _jsonwebtoken2.default.sign({ role: userObject.role, email: body.email }, process.env.SECRET_KEY);
        await _user2.default.updateToken(token);
        userObject.token = token;
        if (isAuth) {
            return res.status(200).json({ user: userObject });
        } else {
            return res.status(401).json({ message: 'Email or password is invalid' });
        }
    } catch (err) {
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
        if (body.upload_id) {
            var uploadObj = await _uploadTable4.default.findOne({ _id: body.upload_id });
            if (uploadObj) {
                uploadObj.user_id = user._id;
                uploadObj.user = user._id;
                await uploadService.updateTable(uploadObj._id, uploadObj);
                var transcriptions = await _transcription4.default.findOne({ upload_id: uploadObj._id });
                if (transcriptions) {
                    transcriptions.user_id = uploadObj.user_id;
                    await transcriptService.updateTranscriptionTable(transcriptions._id, transcriptions);
                }
            }
            var textObj = await _text4.default.findOne({ _id: body.upload_id });
            if (textObj) {
                textObj.user_id = user._id;
                await textModelService.updateText(textObj._id, textObj);
            }
        }
        var questionnaireRequired = false;
        if (body.where_from === process.env.MAINDOMAIN || !user.referral_code.length) {
            questionnaireRequired = true;
        }
        return res.status(200).json({ user: user, questionnaireRequired: questionnaireRequired });
    } catch (err) {
        console.log(err);
        if (err.name == 'MongoError') {
            return res.status(400).json({ message: 'The email address already exist', code: 1 });
        }
        return res.status(500).json({ message: err });
    }
};
var getAllRecords = exports.getAllRecords = async function getAllRecords(req, res) {
    try {
        var user = void 0;
        if (req.user && req.user.email) {
            user = await _user2.default.login(req.user.email);
        } else {
            return res.status(401).json({ message: 'User information not found' });
        }
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
var changeRecordStatus = exports.changeRecordStatus = async function changeRecordStatus(req, res) {
    try {
        var user = void 0;
        var body = req.body;
        console.log(body);
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: 'User information not found' });
        }
        if (req.user && req.user.email) {
            user = await _user2.default.login(req.user.email);
        }
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }
        if (body.type === 'upload') {
            var uploadObj = await _uploadTable4.default.findOne({ _id: body.upload_id });
            if (body.contentType === 'contribute') {
                uploadObj.contribute_to_science = !!body.status;
            } else {
                uploadObj.share = body.status;
            }
            await uploadService.updateTable(uploadObj._id, uploadObj);
        } else {
            var textObj = await _text4.default.findOne({ _id: body.upload_id });
            if (body.contentType === 'contribute') {
                textObj.contribute_to_science = !!body.status;
            } else {
                textObj.share = body.status;
            }
            await textModelService.updateText(textObj._id, textObj);
        }
        return res.status(200).json({ result: true });
    } catch (err) {
        if (err.name == 'MongoError') {
            return res.status(400).json({ message: err, code: 1 });
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
var removeRecordsHandler = exports.removeRecordsHandler = async function removeRecordsHandler(req, res) {
    try {
        var body = req.body;
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: 'User information not found' });
        }
        var user = await _user2.default.login(req.user.email);
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }
        if (body.type === 'upload') {
            await _uploadTable4.default.findOneAndDelete({ _id: body.upload_id });
        } else {
            await _text4.default.findOneAndDelete({ _id: body.upload_id });
        }
        return res.status(200).json({ result: true });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
};

var userUpdateHandler = exports.userUpdateHandler = async function userUpdateHandler(req, res) {
    try {
        if (req.user && req.user.email) {
            var user = await _user2.default.getUserIdByEmail(req.user.email);
            var token = await _jsonwebtoken2.default.sign({ role: user.role, email: user.email }, process.env.SECRET_KEY);
            user.email = req.body.email;
            user.name = req.body.name;
            user.token = token;
            await _user2.default.update(user._id, user);
            return res.status(200).json({ result: user });
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false });
    }
};

var getAccount = exports.getAccount = async function getAccount(req, res) {
    try {
        if (req.user && req.user.email) {
            var user = await _user2.default.getUserIdByEmail(req.user.email);
            return res.status(200).json({ result: user });
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (err) {
        console.log(err);
        return res.status(200).json({ message: err });
    }
};
var changePassword = exports.changePassword = async function changePassword(req, res) {
    try {
        if (req.user && req.user.email) {
            var body = req.body;
            var user = await _user2.default.getUserIdByEmail(req.user.email);
            var isAuth = _bcrypt2.default.compareSync(body.old_password, user.password);
            if (isAuth) {
                body.new_password = await _bcrypt2.default.hashSync(body.new_password, 10);
                body.token = await _jsonwebtoken2.default.sign({ role: user.role, email: user.email }, process.env.SECRET_KEY);
                user.token = body.token;
                user.password = body.new_password;
                await _user2.default.update(user._id, user);
                return res.status(200).json({ result: user });
            } else {
                return res.status(200).json({ message: 'Old password is invalid' });
            }
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (err) {
        return res.status(200).json({ message: err });
    }
};
var saveUserQuestionnaire = exports.saveUserQuestionnaire = async function saveUserQuestionnaire(req, res) {
    try {
        if (req.user && req.user.email) {
            var user = await _user2.default.getUserIdByEmail(req.user.email);
            var userId = user._id;
            await questionnaryService.createDBObject(userId, req.body.questionnaireData);
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.status(200).json({ message: 'Successfully updated' });
    } catch (err) {
        return res.status(200).json({ message: err });
    }
};