// app/routes.js

// grab the nerd model we just created
var Event = require('./models/calendar');

    module.exports = function(app) {

        // server routes ===========================================================
        // handle things like api calls
        // authentication routes

        // getting the training session data using trainer id
        app.get('/api/calendar', function(req, res) {
            // get all the events for the current calendar
            // we do this by requesting all records that contain the trainerId
            // trainer 
            console.log(req.query);
            var id = req.query.id;
            Event.find({trainer: id}, function(err, events) {

                // if there is an error retrieving, send the error. 
                                // nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                console.log(events);
                res.json(events); // return all scheduled events in JSON format
            });
        });

        // for saving a new training session
        app.post('/api/calendar', function(req, res){
            console.log("response: ", res);
            console.log("request body: ", req.body);
            var eventData = req.body;
            var newEvent = new Event(eventData);

            newEvent.save(function(err){

                if (err){
                    res.send(err);
                    console.log(err);
                }
                res.send("session saved!");
                console.log("session saved!");
            });
        });



        // route to handle creating goes here (app.post)
        // route to handle delete goes here (app.delete)

        // frontend routes =========================================================
        // route to handle all angular requests
        app.get('/', function(req, res) {
            res.sendFile("index.html", { root: "./public"}); // load our public/index.html file
        });

    };