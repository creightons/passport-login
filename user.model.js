var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');
	
var userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

var User = mongoose.model('User', userSchema);

module.exports = User;