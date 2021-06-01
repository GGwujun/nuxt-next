import { SET_USER_DATA } from "./mutation-type";

export default {
  state() {
    return {
      // 第一次进入银河系统
      isVirgin: false,
      // 用户设置
      settings: {dsx:1},
      name:'dsx'
    };
  },

  mutations: {
    [SET_USER_DATA](state, { key, value } = {}) {
      state[key] = value;
    },
  },

  actions: {
    // 初始化用户信息
    async init({ commit }) {
      commit(SET_USER_DATA, {
        key: "settings",
        value: {},
      });
      commit(SET_USER_DATA, {
        key: "isVirgin",
        value: true,
      });
    },
  },
};
