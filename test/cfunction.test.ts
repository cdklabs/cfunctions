import { CFunction, CFunctionProps } from '../src';
import { snap, fails } from './util';

test('no capture', snap(() => new CFunction({
  capture: {},
  code: 'true;',
})));

test('compilation error', fails(() => new CFunction({
  code: 'i..;',
}), /esbuild failed/));

test('primitive', snap(() => new CFunction({
  capture: { hello: 22 },
  code: 'true;',
})));

test('array objects', snap(() => new CFunction({
  capture: { hello: [1, 2, 'hello', true, { world: 1 }] },
  code: 'true;',
})));

test('with classees', fails(() => {
  class Hello { }

  return new CFunction({
    capture: { a_class: new Hello() },
    code: 'true;',
  });
}, /classes are not supported/));

test('multiple captures', snap(() => new CFunction({
  capture: {
    hello: 'yes',
    data: {
      field1: ['a', 'b'],
      field2: true,
    },
  },
})));

test('respects toJson()', snap(() => new CFunction({
  capture: {
    hello: { toJson: () => 14 },
  },
})));

test('rejects functions', fails(() => new CFunction({
  capture: {
    boom: () => 123,
  },
}), /cannot capture functions/));

test('a real example', snap(() => new CFunction({
  capture: {
    x: 12,
    y: 78,
  },
  code: 'x + y',
})));

test('output is executable', snap(() => {
  const cf = new CFunction({
    capture: { lhs: 10, rhs: 30 },
    code: 'lhs * rhs',
  });

  const result = CFunction.exec(cf.outfile, {
    env: cf.env,
  });

  expect(result).toBe(300);

  return result;
}));

test('exec without required variables', fails(() => {
  const cf = new CFunction({
    capture: { lhs: 10, rhs: 30 },
    code: 'lhs * rhs',
  });

  CFunction.exec(cf.outfile);
}, /missing required environment variable '__CF__lhs__'/));

function captureAndExecute(props: CFunctionProps) {
  const cf = new CFunction(props);
  return CFunction.exec(cf.outfile);
}

test('function literal', snap(() => {
  const result = captureAndExecute({
    code: (() => { return 'value from a function'; }).toString(),
  });

  expect(result).toBe('value from a function');

  return result;
}));

test('async literal', snap(() => {
  const result = captureAndExecute({
    code: (async () => { return 'value from a function'; }).toString(),
  });

  expect(result).toStrictEqual('value from a function');

  return result;
}));

test('function', snap(() => {
  function code() {
    return 42;
  }

  const result = captureAndExecute({
    code: code.toString(),
  });

  expect(result).toBe(42);
  return result;
}));

test('async function', snap(() => {
  async function code() {
    async function f2(x: number) {
      return x * 2;
    }

    return {
      yes: 'async',
      no: await f2(50),
    };
  }

  const result = captureAndExecute({
    code: code.toString(),
  });

  return result;
}));

test('capture another cfunction', snap(() => {
  const f1 = new CFunction({
    code: '() => 42',
  });

  const f2 = new CFunction({
    code: 'async function(x) { return 3 * x; }',
  });

  const f3 = new CFunction({
    capture: {
      f1,
      boom: f2,
    },
    code: 'async () => await f1() + 2 + await boom(77)',
  });

  const result = CFunction.exec(f3.outfile);
  expect(result).toStrictEqual(42 + 2 + 3 * 77);

  return f3;
}));
