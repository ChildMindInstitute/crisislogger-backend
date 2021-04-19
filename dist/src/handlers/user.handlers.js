'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllUsersRecords = exports.updatePublishStatus = exports.updateApproveStatus = exports.getTextByIds = exports.getTextById = exports.getUploadsByIds = exports.getUploadId = exports.closeMyAccount = exports.saveUserQuestionnaire = exports.changePassword = exports.getAccount = exports.userUpdateHandler = exports.removeRecordsHandler = exports.userDeleteHandler = exports.changeRecordStatus = exports.getAllRecords = exports.userSignUpHandler = exports.userSignInHandler = undefined;

var _user = require('../database/services/user.service');

var _user2 = _interopRequireDefault(_user);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

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

var _bodyParser = require('body-parser');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var uploadService = new _uploadTable2.default();
var textModelService = new _text2.default();
var transcriptService = new _transcription2.default();
var questionnaryService = new _questionnary2.default();

var userSignInHandler = exports.userSignInHandler = async function userSignInHandler(req, res) {
  try {
    var body = req.body;
    var host = req.headers.origin.split('//')[1];
    var userObject = await _user2.default.login(body.email, host);
    var oldUserObject = await _user2.default.getUserByEmail(body.email);
    if (userObject === null && oldUserObject) {
      try {
        var status = await _axios2.default.post(process.env.LEGACY_PHP_HOSTNAME + '/api/login', {
          email: body.email,
          password: body.password
        });
        if (status.data.success) {
          var newPassword = await _bcrypt2.default.hashSync(body.password, 10); //regenerate the password.
          var _token = await _jsonwebtoken2.default.sign({ role: body.role, email: body.email, host: host }, process.env.SECRET_KEY);
          var updateFields = {
            password: newPassword,
            token: _token,
            where_from: host
          };
          oldUserObject.password = newPassword;
          userObject = oldUserObject;
          await _user2.default.update(oldUserObject._id, updateFields);
        } else {
          return res.status(401).json({ message: "User doesn't exist or not authorized to login here" });
        }
      } catch (error) {
        return res.status(401).json({ message: "User doesn't exist or not authorized to login here" });
      }
    }
    if (userObject == null) {
      return res.status(401).json({ message: "User doesn't exist or not authorized to login here" });
    }
    var isAuth = _bcrypt2.default.compareSync(body.password, userObject.password);
    var token = await _jsonwebtoken2.default.sign({ role: userObject.role, email: userObject.email, host: host }, process.env.SECRET_KEY);
    userObject.token = token;
    await _user2.default.updateToken(userObject._id, token);
    if (isAuth) {
      return res.status(200).json({ user: userObject });
    } else {
      return res.status(401).json({ message: 'Email or password is invalid' });
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
    body.where_from = req.headers.origin.split('//')[1];
    body.password = await _bcrypt2.default.hashSync(body.password, 10);
    body.token = await _jsonwebtoken2.default.sign({ role: 1, email: body.email, host: body.where_from }, process.env.SECRET_KEY);
    var userObject = await _user2.default.login(body.email, body.where_from);
    if (userObject !== null) {
      return res.status(400).json({ message: "Email address already exist" });
    }
    var user = await _user2.default.register(body);
    if (body.upload_id) {
      var options = { user_id: user._id, user: user._id };
      var uploadObj = await _uploadTable4.default.findOne({ _id: body.upload_id });
      if (uploadObj) {
        await uploadService.updateTable(uploadObj._id, options);
        var transcriptions = await _transcription4.default.findOne({ upload_id: uploadObj._id });
        if (transcriptions) {
          await transcriptService.updateTranscriptionTable(transcriptions._id, options);
        }
      }
      var textObj = await _text4.default.findOne({ _id: body.upload_id });
      if (textObj) {
        var _options = { user_id: user._id };
        await textModelService.updateText(textObj._id, _options);
      }
    }
    var questionnaireRequired = false;
    if (body.where_from === process.env.MAINDOMAIN || !user.referral_code.length) {
      questionnaireRequired = true;
    }
    return res.status(200).json({ user: user, questionnaireRequired: questionnaireRequired });
  } catch (err) {
    console.log(err);
    if (err.name === 'MongoError') {
      return res.status(400).json({ message: 'Something went wrong, please try again later.', code: 1 });
    }
    return res.status(500).json({ message: err });
  }
};
var getAllRecords = exports.getAllRecords = async function getAllRecords(req, res) {
  try {
    var user = void 0;
    var where_from = req.headers.origin.split('//')[1];
    if (req.user && req.user.email) {
      user = await _user2.default.login(req.user.email, where_from);
    } else {
      return res.status(401).json({ message: 'User information not found' });
    }
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }
    var uploads = await uploadService.getUserUploads(user._id, where_from);
    var texts = await textModelService.getUserTexts(user._id, where_from);

    return res.status(200).json({ records: { uploads: uploads, texts: texts } });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
var changeRecordStatus = exports.changeRecordStatus = async function changeRecordStatus(req, res) {
  try {
    var user = void 0;
    var body = req.body;
    var where_from = req.headers.origin.split('//')[1];
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'User information not found' });
    }
    if (req.user && req.user.email) {
      user = await _user2.default.login(req.user.email, where_from);
    }
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }
    var options = void 0;
    if (body.type === 'upload') {
      var uploadObj = await _uploadTable4.default.findOne({ _id: body.upload_id });
      if (body.contentType === 'contribute') {
        options = {
          contribute_to_science: !!body.status
        };
      } else {
        options = {
          share: body.status
        };
      }
      await uploadService.updateTable(uploadObj._id, options);
    } else {
      var textObj = await _text4.default.findOne({ _id: body.upload_id });
      if (body.contentType === 'contribute') {
        options = {
          contribute_to_science: !!body.status
        };
      } else {
        options = {
          share: body.status
        };
      }
      await textModelService.updateText(textObj._id, options);
    }
    return res.status(200).json({ result: true });
  } catch (err) {
    if (err.name === 'MongoError') {
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
    var where_from = req.headers.origin.split('//')[1];
    var user = await _user2.default.login(req.user.email, where_from);
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
      var where_from = req.headers.origin.split('//')[1];
      var user = await _user2.default.getUserByEmail(req.user.email, where_from);

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      var token = await _jsonwebtoken2.default.sign({ role: user.role, email: req.body.email, host: where_from }, process.env.SECRET_KEY);
      var userObj = {
        email: req.body.email,
        name: req.body.name,
        token: token,
        role: user.role,
        referral_code: user.referral_code,
        password: user.password,
        country: user.country,
        host: where_from
      };
      var createdUser = await _user2.default.update(user._id, userObj);
      return res.status(200).json({ result: createdUser });
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
      var where_from = req.headers.origin.split('//')[1];
      var user = await _user2.default.getUserByEmail(req.user.email, where_from);
      console.log(user);
      if (user) {
        return res.status(200).json({ result: user });
      } else {
        return res.status(401).json({ result: null });
      }
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
      var where_from = req.headers.origin.split('//')[1];
      var user = await _user2.default.getUserByEmail(req.user.email, where_from);
      var isAuth = _bcrypt2.default.compareSync(body.old_password, user.password);
      if (isAuth) {
        body.new_password = await _bcrypt2.default.hashSync(body.new_password, 10);
        body.token = await _jsonwebtoken2.default.sign({ role: user.role, email: user.email, host: where_from }, process.env.SECRET_KEY);
        var obj = {
          token: body.token,
          password: body.new_password
        };
        await _user2.default.update(user._id, obj);
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
      var where_from = req.headers.origin.split('//')[1];
      var user = await _user2.default.getUserByEmail(req.user.email, where_from);
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
var closeMyAccount = exports.closeMyAccount = async function closeMyAccount(req, res) {
  try {
    if (req.user && req.user.email) {
      var where_from = req.headers.origin.split('//')[1];
      var user = await _user2.default.getUserByEmail(req.user.email, where_from);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      await _user2.default.delete(user._id);
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.status(200).json({ message: 'Successfully updated' });
  } catch (err) {
    return res.status(200).json({ message: err });
  }
};
var getUploadId = exports.getUploadId = async function getUploadId(req, res) {
  try {
    var id = req.params.id;
    var result = await uploadService.getUploadById(id);
    if (result) {
      if (result.user) {
        result["user"] = { _id: result.user._id, name: result.user.name, email: result.user.email };
      }
      return res.status(200).json({ data: result });
    }
    return res.status(401).json({ message: "Not found" });
  } catch (err) {
    return res.status(200).json({ message: err });
  }
};
var getUploadsByIds = exports.getUploadsByIds = async function getUploadsByIds(req, res) {
  try {
    var ids = req.query.ids.split(",");
    var result = await uploadService.getUploadsByIds(ids);
    if (result) {
      for (var index = 0; index < result.length; index++) {
        if (result[index].user) {
          result[index].user = {
            _id: result[index].user._id, name: result[index].user.name, email: result[index].user.email
          };
        }
      }
      return res.status(200).json({ data: result });
    }
    return res.status(401).json({ message: "Not found" });
  } catch (err) {
    return res.status(200).json({ message: err });
  }
};
var getTextById = exports.getTextById = async function getTextById(req, res) {
  try {
    var id = req.params.id;
    var result = await textModelService.getTextWithId(id);

    if (result) {
      if (result.user_id) {
        result = result.toObject();
        result["user"] = { _id: result.user_id._id, name: result.user_id.name, email: result.user_id.email };
        delete result.user_id;
      }
      return res.status(200).json({ data: result });
    }
    return res.status(401).json({ message: "Not found" });
  } catch (err) {
    return res.status(200).json({ message: err });
  }
};
var getTextByIds = exports.getTextByIds = async function getTextByIds(req, res) {
  try {
    var ids = req.query.ids.split(",");
    var result = await textModelService.getTextsWithId(ids);
    if (result) {
      for (var index = 0; index < result.length; index++) {
        if (result[index].user_id) {
          result[index]["user_id"] = {
            _id: result[index].user_id._id, name: result[index].user_id.name, email: result[index].user_id.email
          };
        }
      }
      return res.status(200).json({ data: result });
    }
    return res.status(401).json({ message: "Not found" });
  } catch (err) {
    return res.status(200).json({ message: err });
  }
};
var updateApproveStatus = exports.updateApproveStatus = async function updateApproveStatus(req, res) {
  try {
    var found = false;
    var id = req.params.id;
    var result = await uploadService.getUploadById(id);
    if (!result) {
      result = await textModelService.getTextWithId(id);
      if (result) {
        found = true;
        result = await textModelService.updateApproveStatus(id, result.approved);
      }
    } else {
      found = true;
      result = await uploadService.updateApproveStatus(id, result.approved);
      // update the upload
    }
    if (result) {
      return res.status(200).json({ data: result });
    }
    return res.status(401).json({ message: "Not found" });
  } catch (err) {
    return res.status(200).json({ message: err });
  }
};
var updatePublishStatus = exports.updatePublishStatus = async function updatePublishStatus(req, res) {
  try {
    var id = req.params.id;
    var result = await uploadService.getUploadById(id);
    if (!result) {
      result = await textModelService.getTextWithId(id);
    } else {
      result = await uploadService.updatePublishStatus(id, result.published);
    }
    if (result) {
      return res.status(200).json({ data: result });
    }
    return res.status(401).json({ message: "Not found" });
  } catch (err) {
    return res.status(200).json({ message: err });
  }
};

var getAllUsersRecords = exports.getAllUsersRecords = async function getAllUsersRecords(req, res) {

  try {
    var where_from = req.headers.origin.split('//')[1];
    var _req$query = req.query,
        usersIncluded = _req$query.usersIncluded,
        usersExcluded = _req$query.usersExcluded,
        dateStart = _req$query.dateStart,
        dateEnd = _req$query.dateEnd,
        searchText = _req$query.searchText,
        refferalCode = _req$query.refferalCode,
        domain = _req$query.domain;

    var idsIncluded = [];
    var idsExluded = [];
    var referralIds = [];
    var filter = {};
    if (refferalCode !== undefined && refferalCode.length > 0) {
      referralIds = await _user2.default.getUserIdsFromRefferals(refferalCode.split(","), where_from);
      idsIncluded = [].concat(_toConsumableArray(idsIncluded), _toConsumableArray(referralIds));
    }
    if (usersIncluded !== undefined && usersIncluded.length > 0) {

      var ids = await _user2.default.getUsersIdsLikeEmails(usersIncluded.split(","), where_from);
      idsIncluded = [].concat(_toConsumableArray(idsIncluded), _toConsumableArray(ids));
    }

    if (idsIncluded.length > 0) {
      filter = {
        $and: [{ user_id: { $in: idsIncluded } }]
      };
    }

    if (domain !== undefined) {
      if (filter["$and"] !== undefined) {
        filter["$and"] = [].concat(_toConsumableArray(filter["$and"]), [{ where_from: where_from }]);
      } else {
        filter["$and"] = [{ where_from: where_from }];
      }
    }
    if (usersExcluded !== undefined && usersExcluded.length > 0) {
      idsExluded = await _user2.default.getUsersIdsLikeEmails(usersExcluded.split(","), where_from);
      if (idsExluded.length > 0) {
        if (filter["$and"] !== undefined) {
          filter["$and"] = [].concat(_toConsumableArray(filter["$and"]), [{ user_id: { $nin: idsExluded } }]);
        } else {
          filter["$and"] = [{ user_id: { $nin: idsExluded } }];
        }
      }
    }
    if (dateStart !== undefined && dateEnd !== undefined) {
      if (filter["$and"] !== undefined) {
        filter["$and"] = [].concat(_toConsumableArray(filter["$and"]), [{
          created_at: {
            $gte: dateStart,
            $lte: dateEnd
          }
        }]);
      } else {
        filter["$and"] = [{
          created_at: {
            $gte: dateStart,
            $lte: dateEnd
          }
        }];
      }
    } else if (dateStart !== undefined) {
      if (filter["$and"] !== undefined) {
        filter["$and"] = [].concat(_toConsumableArray(filter["$and"]), [{
          created_at: {
            $gte: dateStart
          }
        }]);
      } else {
        filter["$and"] = [{
          created_at: {
            $gte: dateStart
          }
        }];
      }
    } else if (dateEnd !== undefined) {
      if (filter["$and"] !== undefined) {
        filter["$and"] = [].concat(_toConsumableArray(filter["$and"]), [{
          created_at: {
            $lte: dateEnd
          }
        }]);
      } else {
        filter["$and"] = [{
          created_at: {
            $lte: dateEnd
          }
        }];
      }
    }
    var textIdsToFilter = [];
    textIdsToFilter = [].concat(_toConsumableArray((await (await uploadService.getUploadsContainingText(_bodyParser.text)).map(function (el) {
      return el._id;
    }))));
    textIdsToFilter = [].concat(_toConsumableArray(textIdsToFilter), _toConsumableArray((await (await textModelService.findTextUploadWithText(searchText)).map(function (el) {
      return el._id;
    }))));
    if (textIdsToFilter.length > 0) {
      if (filter["$and"] !== undefined) {
        filter["$and"] = [].concat(_toConsumableArray(filter["$and"]), [{ _id: { "$in": textIdsToFilter } }]);
      } else {
        filter["$and"] = [{ _id: { "$in": textIdsToFilter } }];
      }
    }

    var uploads = await uploadService.getUploadsWithFilter(filter);
    var texts = await textModelService.getTextWithFilter(filter);
    var combineData = [].concat(_toConsumableArray(uploads), _toConsumableArray(texts));
    combineData.sort(function (a, b) {
      var date1 = new Date(a.created_at);
      var date2 = new Date(b.created_at);
      return date2 - date1;
    });
    var dataByDate = {};
    combineData.forEach(function (el) {
      var date = new Date(el.created_at).toLocaleDateString();
      if (dataByDate[date] === undefined) {
        dataByDate[date] = [el];
      } else {
        dataByDate[date] = [].concat(_toConsumableArray(dataByDate[date]), [el]);
      }
    });
    return res.status(200).json({
      records: Object.values(dataByDate),
      filter: filter
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};