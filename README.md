# CFunctions

CFunctions (cloud functions, compute functions, construct functions) are a
building block of the [constructs programming model] which can be used to
package JavaScript code and run it on a cloud system.

Let's take a look at a simple CFunction:

```ts
const { CFunction } = require('cfunctions');

const cfunc = new CFunction({
  capture: [ 'x', 'y' ],
  code: 'x + y'
});

console.log('outfile:', cfunc.outfile);
console.log('env:', cfunc.env);
```

The output will look like this:

```shell
outfile: /tmp/.cf.out.TAJEO8/cf.js
env: { __CF__x__: '100', __CF__y__: '200' }
```

The `cf.js` file is a a self-contained JavaScript module which can be loaded
through a `require()` statement and returns an async function that executes the
code after binding it from a set of environment variables.

Let's execute our cfunction:

```shell
$ export __CF__x__=123
$ export __CF__y__=10
$ node -e "require('/tmp/.cf.out.TAJEO8/cf.js')().then(result => console.log(result))"
12310
```

The `CFunction.exec()` static method can also be used to execute the function:

```js
const result = CFunction.exec('/tmp/.cf.out.TAJEO8/cf.js', {
  env: {
    __CF__x__: 123,
    __CF__y__: 10
  }
});

console.log(result);
```

## License

Licensed under the [Apache 2.0](./LICENSE) license.
