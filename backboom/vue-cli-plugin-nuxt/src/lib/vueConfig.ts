const fs = require('fs');
const path = require('path');

const plugins: any[] = [];

if (process.env.NODE_ENV !== 'production') {
  plugins.push();
}

const vueConfig: any = {
  parallel: false, // 因为传入了自定义 compiler，避免参数丢失，禁用parallel
};

export default {};
