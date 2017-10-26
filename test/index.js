'use strict';
const supportsPromise = require('../'),
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
	});
});