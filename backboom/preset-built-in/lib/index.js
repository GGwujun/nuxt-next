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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default() {
  return {
    plugins: [// register methods
    require.resolve('./plugins/registerMethods'), // misc
    require.resolve('./plugins/routes'), // generate nuxt file
    require.resolve('./plugins/generateFiles/router'), require.resolve('./plugins/generateFiles/App'), require.resolve('./plugins/generateFiles/client'), require.resolve('./plugins/generateFiles/middleware'), require.resolve('./plugins/generateFiles/index'), require.resolve('./plugins/generateFiles/router.scrollBehavior'), require.resolve('./plugins/generateFiles/store'), require.resolve('./plugins/generateFiles/utils'), require.resolve('./plugins/features/outputPath'), require.resolve('./plugins/commands/dev/dev')]
  };
}