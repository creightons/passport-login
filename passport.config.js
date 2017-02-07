var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('./user.model');

passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, cb) {
	User.findById(id).then(
		user => done(null, user)
	).catch(
		err => done(err)
	);
});

function startPassport() {
	passport.use(
		new LocalStrategy(function(username, password, done) {
			User.findOne({ username }).then(user => {
				if (!user) { return done(null, false); }
				if (!user.password) { return done(null, false); }
				return done(null, { username: user });
			}).catch(
				err => done(err)
			);
		})
	);
}

module.exports = startPassport;