(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.indexes = exports.all = exports.main = undefined;

var _regenerator = __webpack_require__(1);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(2);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var main = exports.main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(event, context, callback) {
    var params, result;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            params = {
              TableName: "rapquiz.artists",
              Key: {
                name: event.pathParameters.name
              }
            };
            _context.prev = 1;
            _context.next = 4;
            return dynamoDbLib.call("get", params);

          case 4:
            result = _context.sent;

            if (result.Item) {
              callback(null, (0, _responseLib.success)(result.Item));
            } else {
              callback(null, (0, _responseLib.failure)({ status: false, error: "Item not found." }));
            }
            _context.next = 12;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);

            console.log(_context.t0);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[1, 8]]);
  }));

  return function main(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var all = exports.all = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(event, context, callback) {
    var params, result;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            params = {
              TableName: "rapquiz.artists",
              ReturnConsumedCapacity: "TOTAL"
            };
            _context2.prev = 1;
            _context2.next = 4;
            return dynamoDbLib.call("scan", params);

          case 4:
            result = _context2.sent;

            if (result.Items) {
              callback(null, (0, _responseLib.success)(result.Items));
            } else {
              callback(null, (0, _responseLib.failure)({ status: false, error: "No items not found." }));
            }
            _context2.next = 12;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](1);

            console.log(_context2.t0);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 8]]);
  }));

  return function all(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

var indexes = exports.indexes = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(event, context, callback) {
    var params, result;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            params = {
              TableName: "rapquiz.artists",
              Key: {
                name: "indexes"
              },
              ProjectionExpression: "#keys",
              ExpressionAttributeNames: {
                "#keys": "keys"
              },
              ReturnConsumedCapacity: "TOTAL"
            };
            _context3.prev = 1;
            _context3.next = 4;
            return dynamoDbLib.call("get", params);

          case 4:
            result = _context3.sent;

            console.log(result.ConsumedCapacity);
            if (result.Item) {
              callback(null, (0, _responseLib.success)(result.Item));
            } else {
              callback(null, (0, _responseLib.failure)({ status: false, error: "Item not found." }));
            }
            _context3.next = 13;
            break;

          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3["catch"](1);

            console.log(_context3.t0);
            callback(null, (0, _responseLib.failure)({ status: false }));

          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[1, 9]]);
  }));

  return function indexes(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();

var _dynamodbLib = __webpack_require__(3);

var dynamoDbLib = _interopRequireWildcard(_dynamodbLib);

var _responseLib = __webpack_require__(5);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/regenerator");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/asyncToGenerator");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.call = call;

var _awsSdk = __webpack_require__(4);

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.update({ region: "eu-central-1" });

function call(action, params) {
  var dynamoDb = new _awsSdk2.default.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = __webpack_require__(6);

var _stringify2 = _interopRequireDefault(_stringify);

exports.success = success;
exports.failure = failure;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function success(body) {
  return buildResponse(200, body);
}

function failure(body) {
  return buildResponse(500, body);
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: (0, _stringify2.default)(body)
  };
}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/json/stringify");

/***/ })
/******/ ])));