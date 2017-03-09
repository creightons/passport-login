var express = require('express'),
	app = express(),
	passport = require('passport'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	config = require('./config'),
	mongoose = require('mongoose'),
	User = require('./user.model'),
	startPassport = require('./passport.config'),
	{ issueToken } = require('./remember-me-utils');

mongoose.connect(config.DB_URL);

RedisStore = require('connect-redis')(session);

app.use(session({
	store: new RedisStore({
		host: config.REDIS_HOST,
		port: config.REDIS_PORT,
	}),
	secret: config.REDIS_SECRET,
	resave: false,
	saveUninitialized: false,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Apply all passport configurations
startPassport(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use('/public', express.static('public'));

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.listen(config.SERVER_PORT, () => {
	console.log('Server is listening on port ', config.SERVER_PORT);
});

app.use((req, res, next) => {
	var fullUrl = req.method + ' ' + req.url;
	console.log(fullUrl);
	next();
});

app.use(passport.authenticate('remember-me'));

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next() };
	return res.redirect('/');
}

// Get the main page
app.get('/', (req, res) => res.render('index'));

// Get sign up page
app.get('/register', (req, res) => res.render('register'));

// Send new account credentials
app.post('/register', (req, res, next) => {
	User.findOne({ username: req.body.username }).then(user => {
		if (user) {
			return res.render('register', { exists: true })
		}

		var newUser = User({
			username: req.body.username,
			password: req.body.password,
		});

		return newUser.save().then(() => {
			req.login(newUser, (err) => {
				if (err) { return next(err); }
				return res.redirect('/main');
			});
		});
	}).catch(
		err => next(err)
	);
});

// Login with local authentication
app.post('/login',
	passport.authenticate('local',  { failureRedirect: '/'}),
	(req, res, next) => {
		if (!req.body.remember_me) { return next(); }

		issueToken(req.user, function(err, token) {
			if (err) { return next(err); }
			res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
			return next();
		})
	},
	(req, res) => {
		res.redirect('/main');
	}
);

// Login using Google OAuth2
app.get('/auth/google',
	passport.authenticate('google', { scope: [ 'profile', 'email' ] } )
);

app.get('/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/main',
		failureRedirect: '/',
	})
);

// Logout 
app.post('/logout', function(req, res) {
	res.clearCookie('remember_me');
	req.logout();
	res.redirect('/');
});

// Return the protected page
app.get('/main', isAuthenticated, (req, res) => {
	res.render('main');
});