'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

require('./envConfigurate');

var _index = require('./src/database/index');

var _index2 = _interopRequireDefault(_index);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _user = require('./src/routes/user.routes');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use(_bodyParser2.default.json());

app.use('/users', _user2.default);

app.listen(process.env.SERVER_PORT, function () {
    console.log('Server strart on port ' + process.env.SERVER_PORT);
});