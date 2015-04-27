// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called
var Schema = mongoose.Schema;
var eventSchema = new Schema({
	trainer : Number,
	message : String
});
module.exports = mongoose.model('Event', eventSchema);