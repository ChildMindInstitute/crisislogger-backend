'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _user = require('../handlers/user.handlers');

var handlers = _interopRequireWildcard(_user);

var _middleware = require('../middleware/middleware');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.use(_express2.default.json());
router.use((0, _expressJwt2.default)({ secret: process.env.SECRET_KEY }).unless({
    path: ['/users/signin', '/users/signup']
}));

router.all('/*', function (req, res, next) {
    var now = new Date();
    var houre = now.getHours();
    var minuts = now.getMinutes();
    var second = now.getSeconds();
    console.log(houre + ':' + minuts + ':' + second + ' Method: ' + req.method + ' : ' + req.path + ' ');
    next();
});
router.post('/signin', handlers.userSignInHandler);
router.post('/signup', handlers.userSignUpHandler);
router.post('/removeAccount', handlers.closeMyAccount);
router.delete('/:id', handlers.userDeleteHandler);
router.put('/change-password', _middleware.checkToken, handlers.changePassword);
router.put('/update-profile', _middleware.checkToken, handlers.userUpdateHandler);
router.get('/me', _middleware.checkToken, handlers.getAccount);
router.get('/getrecords', _middleware.checkToken, handlers.getAllRecords);
router.post('/changeRecordStatus', _middleware.checkToken, handlers.changeRecordStatus);
router.post('/removeRecords', _middleware.checkToken, handlers.removeRecordsHandler);
router.post('/questionnaire', handlers.saveUserQuestionnaire);
exports.default = router;