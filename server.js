var app = require('express')(),
	passport = require('passport'),
	session = require('express-session'),
	redis = require('connect-redis')(session),
	config = require('./config'),
	startPassport = require('./passport.config');
	
app.use(session({
	store: new redis({
		host: config.REDIS_HOST,
		port: config.REDIS_PORT,
	}),
	secret: config.REDIS_SECRET,
}));

startPassport();
app.use(passport.initialize());
app.use(passport.session());

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

app.get('/', (req, res) => res.render('index'));