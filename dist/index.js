'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _expressFileupload = require('express-fileupload');

var _expressFileupload2 = _interopRequireDefault(_expressFileupload);

require('./envConfigurate');

var _index = require('./src/database/index');

var _index2 = _interopRequireDefault(_index);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _user = require('./src/routes/user.routes');

var _user2 = _interopRequireDefault(_user);

var _file = require('./src/routes/file.routes');

var _file2 = _interopRequireDefault(_file);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.use((0, _expressFileupload2.default)({
    createParentPath: true
}));

app.use((0, _cors2.default)());

app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use(_bodyParser2.default.json());

app.use('/users', _user2.default);
app.use('/file', _file2.default);

app.listen(process.env.SERVER_PORT, function () {
    console.log('Server strart on port ' + process.env.SERVER_PORT);
});