module.exports = function (fn, context) {
	return function () {
		var args = [].slice.apply(arguments),
			callback = args.pop(),
			rejectOnError = false;

		if (typeof callback !== 'function') {
			rejectOnError = true;
			if (arguments.length > 0) {
				args.push(callback);
			}
			callback = function () {
			};
		}

		return new Promise((resolve, reject) => {
			var callback_ = function () {
				var cbArgs = [].slice.apply(arguments),
					error = cbArgs.shift();

				if (error) {
					rejectOnError && reject(error);
					return callback(error);
				}

				var promiseResults = cbArgs.slice(),
					promiseSingleResult = promiseResults.length ?
						promiseResults.length > 1 ? promiseResults : promiseResults[0]
						: null;

				resolve(promiseSingleResult);

				cbArgs.unshift(null);
				return callback.apply(null, cbArgs);
			};

			args.push(callback_);
			try {
				fn.apply(context || null, args);
			} catch (e) {
				rejectOnError && reject(e);
				return callback(e);
			}
		});
	};
};

module.exports.retry = (promise, retryConfig) => {
	retryConfig = retryConfig || {};
	const interval = retryConfig.interval || 0,
		times = retryConfig.times || 5,
		attempt = (count) => {
			const retryIn = count === times - 1 ? 0 : interval;

			return new Promise((resolve, reject) => {
				setTimeout(() => {
					promise()
						.catch(e => {
							if (count > 0) {
								return attempt(count - 1);
							}
							throw e;
						})
						.then(resolve)
						.catch(reject);
				}, retryIn);
			});
		};

	return attempt(times - 1);
};