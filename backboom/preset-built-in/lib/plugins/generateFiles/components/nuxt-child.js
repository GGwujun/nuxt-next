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

var _default = {
  name: 'NuxtChild',
  functional: true,
  props: {
    nuxtChildKey: {
      type: String,
      default: ''
    },
    keepAlive: Boolean,
    keepAliveProps: {
      type: Object,
      default: undefined
    }
  },

  render() {
    let routerView = (0, _vue().h)((0, _vue().resolveComponent)('routerView'), this.$props);

    if (this.$props.keepAlive) {
      routerView = (0, _vue().h)((0, _vue().resolveComponent)('keep-alive'), ...this.$props.keepAliveProps, [routerView]);
    }

    return routerView;
  }

};
exports.default = _default;