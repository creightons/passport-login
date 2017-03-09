// Token saving should be implemented as saving in Redis
const tokens = {};

function consumeRememberMeToken(token, callback) {
	const uid = tokens[token];

	delete tokens[token];

	return callback(null, uid);
}

function saveRememberMeToken(token, uid, callback) {
  tokens[token] = uid;
  return callback();
}

function createToken() {
	// Implement token here
	return null;
}

function issueToken(user, done) {
	const token = createToken(); // get random token

	saveRememberMeToken(token, user._id, function(err) {
		if (err) { return done(err); }
		return done(null, token);
	});
}

module.exports = {
	saveRememberMeToken,
	issueToken,
};