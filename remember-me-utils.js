const Promise = require('bluebird');

// Token saving should be implemented as saving in Redis
const tokens = {};

function consumeRememberMeToken(token) {
	const uid = tokens[token];

	delete tokens[token];

	return Promise.resolve(uid);
}

function saveRememberMeToken(token, uid) {
  tokens[token] = uid;
  return Promise.resolve();
}

function createToken() {
	const inputs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let token = '';

	for (let i = 0; i < 20; i++) {
		token += inputs.charAt(
			Math.floor(
				Math.random() * inputs.length
			)
		);
	}

	return token;
}

function issueToken(user, done) {
	const token = createToken(); // get random token

	saveRememberMeToken(token, user._id).then(() => {
		return done(null, token);
	}).catch(err => {
		return done(err);
	});
}

module.exports = {
	consumeRememberMeToken,
	issueToken,
};