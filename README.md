# promise-support
Promises + Callbacks support wrapper

## Why?
In situation when function should support both callbacks and Promises, this is simple wrapper which gives this out of the box

## Usage

```javascript
const supportsPromise = require('promise-support');
const myFn = (arg1, arg2, arg3, callback) => {
  setImmediate(() => {
    callback(null, arg1, arg2, arg3);
  });
};

const wrappedFn = supportsPromise(myFn);
wrappedFn(1, 2, 3, (err, first, second, third) => {
	//do smth old-styled callbacks way
});
// OR use promises:
wrappedFn(1, 2, 3)
.then(res => {/*do smth with result*/})
.catch(err => {/*do smth with err*/});
// OR async:
try {
	const result = await wrappedFn(1, 2, 3);
	// do smth with result
} catch (e) {
	// do smth with error
}

```

## Promise result wrapping
* Original function passes only 1 parameter => promise will get this parameter when resolved.
* Original function passes multiple parameters => promise will array with parameters.