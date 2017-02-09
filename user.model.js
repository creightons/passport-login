var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');
	
var userSchema = new Schema({
	username: String,
	password: String,
	googleId: String,
	googleToken: String,
});

var User = mongoose.model('User', userSchema);

module.exports = User;