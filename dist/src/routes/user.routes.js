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
    console.log(houre + ':' + minuts + ':' + second + ' Metod: ' + req.method + ' : ' + req.path + ' ');
    next();
});

router.post('/signin', handlers.userSignInHandler);

router.post('/signup', handlers.userSignUpHandler);

router.delete('/:id', handlers.userDeleteHandler);

router.put('/:id', handlers.userUpdateHandler);

exports.default = router;