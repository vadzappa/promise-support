module.exports = function(fn, context) {
	return function() {
		var args = [].slice.apply(arguments),
			callback = args.pop();

		if (typeof callback !== 'function') {
			args.push(callback);
			callback = function() {
			};
		}

		return new Promise((resolve, reject) => {
			var callback_ = function() {
				var cbArgs = [].slice.apply(arguments),
					error = cbArgs.shift();

				if (error) {
					reject(error);
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
				reject(e);
				return callback(e);
			}
		});
	};
};