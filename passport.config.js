var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('./user.model');

passport.serializeUser(function(user, done) {
	console.log('serializeUser: ', user);
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	console.log('deserializeUser: ', id);

	User.findById(id).then(
		user => done(null, user)
	).catch(
		err => done(err)
	);
});

function startPassport() {
	passport.use(
		'local',
		new LocalStrategy(function(username, password, done) {
			User.findOne({ username }).then(user => {
				console.log('got here', user);
				console.log('arguments = ', arguments);
				if (!user) { return done(null, false); }
				if (!user.password) { return done(null, false); }
				return done(null, user);
			}).catch(
				err => done(err)
			);
		})
	);
}

module.exports = startPassport;