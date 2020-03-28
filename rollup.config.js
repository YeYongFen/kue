const babel = require('rollup-plugin-babel');
const serve = require('rollup-plugin-serve');

export default {
  input: './src/core/instance/index.js',
  output: {
    file: 'dist/index.js',
    name: 'Kue',
    format: 'umd',
  },
  plugins: [
    babel(),
    serve({
      open: false,
      contentBase: './',
    })
  ],
};
