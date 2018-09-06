'use strict';
const supportsPromise = require('../'),
	sinon = require('sinon'),
	assert = require('assert');

describe('promises-support', () => {
	describe('callbacks', () => {
		it('should wrap original function', (done) => {
			const myFn = (arg1, arg2, arg3, callback) => {
				setImmediate(() => {
					callback(null, arg1, arg2, arg3);
				});
			};

			let wrappedFn = supportsPromise(myFn);

			wrappedFn(1, 2, 3, (err, first, second, third) => {
				assert.ifError(err);
				assert.equal(first, 1, 'should bypass args');
				assert.equal(second, 2, 'should bypass args');
				assert.equal(third, 3, 'should bypass args');
				done();
			});
		});

		it('should wrap original function sending error', (done) => {
			const myFn = (arg1, arg2, arg3, callback) => {
				setImmediate(() => {
					callback('Error');
				});
			};

			let wrappedFn = supportsPromise(myFn);

			wrappedFn(1, 2, 3, (err, first, second, third) => {
				assert.ok(err);
				assert.equal(err, 'Error', 'should send error');
				assert.ok(!first, 'should not pass args');
				assert.ok(!second, 'should not pass args');
				assert.ok(!third, 'should not pass args');
				done();
			});
		});

		it('should handle sync error', (done) => {
			const myFn = (arg1, arg2, arg3, callback) => {
				if (arg1 === arg2) {
					throw new Error('sync error');
				}
				callback(null, arg1, arg2, arg3);
			};

			let wrappedFn = supportsPromise(myFn);

			wrappedFn(2, 2, 3, (err, first, second, third) => {
				assert.ok(err);
				assert.ok(!first, 'should not pass args');
				assert.ok(!second, 'should not pass args');
				assert.ok(!third, 'should not pass args');
				done();
			});
		});
	});

	describe('promises', () => {
		it('should wrap original function (no results)', (done) => {
			const myFn = (arg1, arg2, arg3, callback) => {
				setImmediate(() => {
					callback(null);
				});
			};

			let wrappedFn = supportsPromise(myFn);

			let promise = wrappedFn(1, 2, 3);
			promise
				.then(results => {
					assert.ok(!results, 'should bypass null result');
					done();
				})
				.catch(err => {
					assert.ifError(err);
					done();
				});
		});
		it('should wrap original function (single result)', (done) => {
			const myFn = (arg1, arg2, arg3, callback) => {
				setImmediate(() => {
					callback(null, arg1);
				});
			};

			let wrappedFn = supportsPromise(myFn);

			let promise = wrappedFn(1, 2, 3);
			promise
				.then(results => {
					assert.equal(results, 1, 'should bypass args unwrapped');
					done();
				})
				.catch(err => {
					assert.ifError(err);
					done();
				});
		});
		it('should wrap original function (multiple results)', (done) => {
			const myFn = (arg1, arg2, arg3, callback) => {
				setImmediate(() => {
					callback(null, arg1, arg2, arg3);
				});
			};

			let wrappedFn = supportsPromise(myFn);

			let promise = wrappedFn(1, 2, 3);
			promise
				.then(results => {
					assert.equal(results[0], 1, 'should bypass args using array');
					assert.equal(results[1], 2, 'should bypass args using array');
					assert.equal(results[2], 3, 'should bypass args using array');
					done();
				})
				.catch(err => {
					assert.ifError(err);
					done();
				});
		});

		it('should wrap original function', (done) => {
			const myFn = (arg1, arg2, arg3, callback) => {
				setImmediate(() => {
					callback('error', arg1, arg2, arg3);
				});
			};

			let wrappedFn = supportsPromise(myFn);

			let promise = wrappedFn(1, 2, 3);
			promise
				.then(results => {
					assert.ifError(results, 'should not resolve');
					assert.ok(false, 'should not resolve');
					done();
				})
				.catch(err => {
					assert.equal(err, 'error');
					done();
				});
		});

		it('should wrap sync error from function', (done) => {
			const myFn = (arg1, arg2, arg3, callback) => {
				if (arg1 === arg2) {
					throw new Error('sync error');
				}
				callback(null, arg1, arg2, arg3);
			};

			let wrappedFn = supportsPromise(myFn);

			let promise = wrappedFn(2, 2, 3);
			promise
				.then(results => {
					assert.ifError(results, 'should not resolve');
					assert.ok(false, 'should not resolve');
					done();
				})
				.catch(err => {
					assert.ok(err, 'should send error');
					done();
				});
		});

		it('should not reject is cb provided (to avoid Unhandled rejection)', (done) => {
			const myFn = (arg1, arg2, arg3, callback) => {
				callback(new Error('wooooo'));
			};

			let wrappedFn = supportsPromise(myFn);

			let promise = wrappedFn(2, 2, 3, (err) => {
				assert.ok(err, 'should send error');
				done();
			});
			promise
				.then(results => {
					assert.ifError(results, 'should not resolve');
					assert.ok(false, 'should not resolve');
					done();
				})
				.catch(err => {
					assert.ifError(err, 'should not reject if callback provided');
				});
		});

		it('should properly wrap rest parameters with no actual args', (done) => {
			const funcWrapper = (fn) => supportsPromise((...rest) => {
				const copy = [...rest];

				copy.unshift('test-arg');

				fn.apply(null, copy);
			});
			const myFn = funcWrapper((str, cb) => {
				if (!str) {
					return cb('error');
				}

				return cb(null, str);
			});

			myFn().then((res) => {
				assert.equal(res, 'test-arg');
				done();
			});
		});
	});

	describe('promise#retry', () => {
		it('should retry needed amount of times and reject', (done) => {
			const retry = supportsPromise.retry;

			let myPromise = sinon.stub().rejects('err');

			retry(myPromise, {interval: 0, times: 5}).then(() => {
				assert.ok(false, 'should not  resolve');
				done();
			}).catch(e => {
				assert.ok(e, 'should reject if amount of times exceeded');
				assert.equal(myPromise.callCount, 5, 'should not call more than `times` specified');
				done();
			});
		});

		it('should retry needed amount of times and resolve', (done) => {
			const retry = supportsPromise.retry;

			let myPromise = sinon.stub()
				.onCall(0).rejects('err')
				.onCall(1).rejects('err')
				.onCall(2).rejects('err')
				.onCall(3).resolves(1);

			retry(myPromise, {interval: 0, times: 5}).then((result) => {
				assert.equal(result, 1, 'should not  resolve');
				assert.equal(myPromise.callCount, 4);
				done();
			}).catch(e => {
				assert.ifError(e, 'should not reject if promise resolved');
				done();
			});
		});
	});
});