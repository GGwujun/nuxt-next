"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  initAutomator(args) {
    const port = args['auto-port'] || process.env.UNI_AUTOMATOR_PORT;

    if (port) {
      const host = args['auto-host'] || process.env.UNI_AUTOMATOR_HOST || '0.0.0.0';

      const prepareURLs = require('@vue/cli-service/lib/util/prepareURLs');

      const urls = prepareURLs('ws', host, port, '');

      if (urls.lanUrlForConfig) {
        process.env.UNI_AUTOMATOR_WS_ENDPOINT = 'ws://' + urls.lanUrlForConfig + ':' + port;
      } else {
        process.env.UNI_AUTOMATOR_WS_ENDPOINT = urls.localUrlForBrowser;
      }
    }
  }

};
exports.default = _default;