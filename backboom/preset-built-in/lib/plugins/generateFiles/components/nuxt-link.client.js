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

function _vue() {
  const data = require("vue");

  _vue = function _vue() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-debugger */
var _default = {
  name: 'NuxtLink',

  render() {
    return (0, _vue().h)((0, _vue().resolveComponent)('RouterLink'), null, this.$slots.default());
  },

  mounted() {}

};
exports.default = _default;