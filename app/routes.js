// app/routes.js

// import the Event schema
var Event = require('./models/calendar');

    module.exports = function(app) {

        // server routes ===========================================================
        // handle things like api calls
        // authentication routes

        app.get('/api/calendar/:id', function(req, res) {
            // get all the events for the current calendar
            // we do this by requesting all records that contain the trainerId
            // trainer 
            var id = req.params.id;
            console.log(req);
            console.log("returning results for trainer: ", id);

            Event.find({trainer: id}, function(err, events) {

                //
                if (err)
                res.send(err);

                var newArr = events.map(function(event){
                    var eventObj = event.toObject();
                    //delete eventObj["_id"];
                    eventObj.startTime = new Date(eventObj.startTime.toString());
                    eventObj.endTime = new Date(eventObj.endTime.toString());
                    return eventObj;
                });

                console.log(newArr);
                res.json(newArr); // return all scheduled events in JSON format
            });
        });

        // route to handle creating goes here (app.post)
        // route to handle delete goes here (app.delete)

        // post route for saving a new training session
        app.post('/api/calendar', function(req, res){
            console.log("response: ", res);
            console.log("request body: ", req.body);
            var eventData = req.body;
            var newEvent = new Event(eventData);

            newEvent.save(function(err, data){

                if (err){
                    res.send(err);
                    console.log(err);
                }
                res.send(data);
                console.log(data);
            });
        });

        // delete route goes here

        app.delete('/api/calendar/:_id', function(req, res){

            console.log(req.params);

            Event.find( { _id: req.params._id } ).remove(function(err, data){

                if (err){
                    console.log(err);
                    res.send(err);
                }

                res.json(data);

            });

        });

        // frontend routes =========================================================
        // route to handle all angular requests
        app.get('/', function(req, res) {
            res.sendFile("index.html", { root: "./public"}); // load our public/index.html file
        });

    };