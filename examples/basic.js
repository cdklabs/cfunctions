const { CFunction } = require('../lib');

const cfunc = new CFunction({
  capture: {
    x: 100,
    y: 200
  },
  code: 'x + y'
});

console.log('outfile:', cfunc.outfile);
console.log('env:', cfunc.env);

console.log('result:', CFunction.exec(cfunc.outfile, {
  env: {
    __CF__x__: 123,
    __CF__y__: 10
  }
}));