angular.module('CalendarsCtrl', ['ui.calendar', 'ui.bootstrap']).controller('CalendarsCtrl', function( $scope, $compile, uiCalendarConfig, $stateParams, Calendar ) {

    /**
 * calendarDemoApp - 0.9.0
 */


    $scope.trainerId = $stateParams.id;
    var trainerId = $scope.trainerId;
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.mytime = new Date();
    $scope.mytime.setHours(9, 0);

    $scope.$watch('mytime', function(time){
      console.log(time);
    });
    
    $scope.changeTo = 'Hungarian';
    /* event source that pulls from google.com */
    $scope.eventSource = {
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
    };
    /* event source that contains custom events on the scope */
    var trainerInfo = {
      id: 2
    };

    $scope.events = Calendar.get(trainerInfo)
      .then(function(res){
        console.log(res);
        //alert("response: ", res);
      })
      .catch(function(err){
       // alert("error: ", err);
      });

    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
      var s = new Date(start).getTime() / 1000;
      var e = new Date(end).getTime() / 1000;
      var m = new Date(start).getMonth();
      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
      callback(events);
    };

    $scope.calEventsExt = {
       color: '#f00',
       textColor: 'yellow',
       events: [ 
          {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key] === source){
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      if(canAdd === 0){
        sources.push(source);
      }
    };



    $scope.showModal = function(){
      console.log("show my modal");
      $scope.displayModal = true;
    };
    /* add custom event*/
    $scope.addEvent = function() {

      $scope.mytime.setMonth($scope.sessionMonth - 1);
      $scope.mytime.setDate($scope.sessionDay);
      $scope.mytime.setYear(2015);
      var clientName = "Jon",
          newEvent = {
            trainer: trainerId,
            clientName: clientName,
            startTime: $scope.mytime,
            endTime: $scope.mytime.setHours($scope.mytime.getHours() + 1),
            title: $scope.title
          };

      if ($scope.events.length){

        $scope.events.push(newEvent);

      } else {

        var events = [].push(newEvent);
        $scope.events = events;

      }

      // create new training session and save to db
      Calendar.create(newEvent)
        .then(function(response){
          alert(response);
          $scope.displayModal = false;
        })
        .catch(function(err){
          alert(err);
        });
    };
    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
      var event = $scope.events[index];
      // delete the record
      Calendar.delete(event)
        .then(function(response){
          alert(response.toString());
        })
        .catch(function(err){
          alert(err.toString());
        });
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
      if(uiCalendarConfig.calendars[calendar]){
        uiCalendarConfig.calendars[calendar].fullCalendar('render');
      }
    };
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'tooltip': event.title,
                      'tooltip-append-to-body': true});
        $compile(element)($scope);
    };
    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };

    $scope.changeLang = function() {
      if($scope.changeTo === 'Hungarian'){
        $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
        $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
        $scope.changeTo= 'English';
      } else {
        $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        $scope.changeTo = 'Hungarian';
      }
    };
    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];
/* EOF */
});
/* EOF */