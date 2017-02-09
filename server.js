var express = require('express'),
	app = express(),
	passport = require('passport'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	config = require('./config'),
	mongoose = require('mongoose'),
	startPassport = require('./passport.config');


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

startPassport();
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

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next() };
	return res.redirect('/');
}

app.get('/', (req, res) => res.render('index'));

app.post('/login',
	passport.authenticate('local',  { failureRedirect: '/'}),
	(req, res) => {
		res.redirect('/main');
	}
);

app.get('/main', isAuthenticated, (req, res) => {
	res.render('main');
});