// app/models/calendar.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our training session data model
// module.exports allows us to pass this to other files when it is called
var Schema = mongoose.Schema;
var eventSchema = new Schema({
	trainer : Number,
	clientName : String,
	start : String,
	end : String,
	Title: String
});


module.exports = mongoose.model('Event', eventSchema);