// app/routes.js

// grab the nerd model we just created
var Calendar = require('./models/calendar');

    module.exports = function(app) {

        // server routes ===========================================================
        // handle things like api calls
        // authentication routes

        // getting the training session data using trainer id
        app.get('/api/calendar', function(req, res) {
            // use mongoose to get all nerds in the database
            Calender.find(1, function(err, sessions) {

                // if there is an error retrieving, send the error. 
                                // nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.json(sessions); // return all nerds in JSON format
            });
        });

        // for saving a new training session
        app.post('/api/calendar', function(req, res){
            Calendar.save(function(err, sessionData){
                if (err){
                    res.send(err);

                }

                res.json("session saved!");
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