"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("fs");

  _fs = function _fs() {
    return data;
  };

  return data;
}

function _path() {
  const data = require("path");

  _path = function _path() {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("@umijs/utils");

  _utils = function _utils() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _default(api) {
  const Mustache = api.utils.Mustache;
  api.onGenerateFiles( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (args) {
      const umiTpl = (0, _fs().readFileSync)((0, _path().join)(__dirname, 'App.tpl'), 'utf-8');
      const rendererPath = yield api.applyPlugins({
        key: 'modifyRendererPath',
        type: api.ApplyPluginsType.modify,
        initialValue: ''
      });
      api.writeTmpFile({
        path: 'App.js',
        content: Mustache.render(umiTpl, {
          // @ts-ignore
          enableTitle: api.config.title !== false,
          defaultTitle: api.config.title || '',
          rendererPath: (0, _utils().winPath)(rendererPath),
          rootElement: api.config.mountElementId,
          enableSSR: !!api.config.ssr,
          dynamicImport: !!api.config.dynamicImport
        })
      });
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}