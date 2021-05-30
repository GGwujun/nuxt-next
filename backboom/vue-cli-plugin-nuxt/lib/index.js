"use strict";

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

var _serve = _interopRequireDefault(require("./commands/serve"));

var _vueConfig = _interopRequireDefault(require("./lib/vueConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const assetsDir = 'static';

module.exports = (api, options) => {
  (0, _serve.default)(api, options);
  Object.assign(options, {
    assetsDir
  }, _vueConfig.default);
  api.configureWebpack(_vueConfig.default);
};