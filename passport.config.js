var LocalStrategy = require('passport-local').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	User = require('./user.model'),
	config = require('./config');


function startPassport(passport) {

	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {

		User.findById(id).then(
			user => done(null, user)
		).catch(
			err => done(err)
		);
	});

	passport.use(
		'local',
		new LocalStrategy(function(username, password, done) {
			User.findOne({ username }).then(user => {
				
				if (!user) { return done(null, false); }
				
				if (!user.password) { return done(null, false); }
				
				return done(null, user);
			}).catch(
				err => done(err)
			);
		})
	);

	passport.use(
		'google',
		new GoogleStrategy({
			clientID: config.GOOGLE_OAUTH_CLIENT_ID,
			clientSecret: config.GOOGLE_OAUTH_CLIENT_SECRET,
			callbackURL: config.GOOGLE_OAUTH_CALLBACK_URL,
		}, function(accessToken, refreshToken, profile, done) {

		//	process.nextTick(function() {
				User.findOne({ googleId: profile.id }).then(user => {
					if (user) { return done(null, user); }

					else {
						var newUser = User({
							googleId: profile.id,
							googleToken: accessToken,
						});

						return newUser.save().then(() => {
							return done(null, newUser);
						});
					}
				}).catch(err => {
					return done(err);
				});
		//	});
		})
	)

}

module.exports = startPassport;