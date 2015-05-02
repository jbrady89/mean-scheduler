angular.module('CalendarsCtrl', ['ui.calendar', 'ui.bootstrap'])
.filter('addOffset', function(){
  return function(val){
    var date = new Date(val);
    var hours = date.getHours();
    date.setHours(hours + 4);
    return date;
  };
})
.controller('CalendarsCtrl', function( $scope, $compile, uiCalendarConfig, $stateParams, Calendar, eventsData) {

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
      id: trainerId
    };

    /*Calendar.get(trainerInfo)
      .then(function(res){
        $scope.events = res.data;
        /*$scope.events = $scope.events.filter(function(event){
          console.log(event);
          if (event.trainer == trainerId){
            return event;
          }
        });
        //$scope.startTime = new Date($scope.events.startTime).getTime() / 1000;
        
      })
      .catch(function(err){
       // alert("error: ", err);
      });*/
  //console.log(eventsData);

      /*eventsData = eventsData.data.map(function(event){
      event.start = new Date(event.start);
      event.end = new Date(event.end);

      return event;
    });*/

    $scope.events = eventsData.data;

    // $scope.events = [
    //   {title: 'All Day Event',start: "04 05 2015 09:00:45", end: "04 05 2015 10:00:45"},
    //   {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
    //   {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
    //   {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
    //   {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
    //   {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    // ];

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
      //console.log("show my modal");
      $scope.displayModal = true;
    };
    /* add custom event*/
    $scope.addEvent = function() {
      //console.log($scope.mytime);
      //console.log($scope.sessionMonth);
      //console.log($scope.sessionDay);
      var month = $scope.mytime.setMonth($scope.sessionMonth - 1);
      var day = $scope.mytime.setDate($scope.sessionDay);
      var year = $scope.mytime.getYear();
      //var offset = $scope.mytime.getTimezoneOffset();
      //var offsetInHours = offset / 60;

      var hours = $scope.mytime.getHours();
     // var hoursMinusOffset = $scope.mytime.setHours(hours + offsetInHours);
      var minutes = $scope.mytime.getMinutes();
      //console.log($scope.mytime + "\n" + $scope.mytime.getHours());
      //console.log(month, day, year, hours, minutes);
      $scope.mytime.setHours(hours - 4);
      var startTime = new Date($scope.mytime.getTime());
          $scope.mytime.setHours(hours + 1);
      var endTime = new Date( $scope.mytime.getTime() );
      var start = startTime;
      var end = endTime;
      //var endHour = $scope.mytime.getHours() + 1;
      // 
      //var end = new Date(start).setHours(endHour);
      //console.log(start, end);

      var clientName = "Jon",
          newEvent = {
            trainer: trainerId,
            clientName: clientName,
            start: start,
            end: end,
            title: $scope.title
          };

      
        //console.log($scope.events.length);
        //$scope.events.push(newEvent);
        //console.log($scope.events.length);

      // create new training session and save to db
      Calendar.create(newEvent)
        .then(function(response){
          //alert(response);
          var newEvent = response.data;
          //console.log(response);
          $scope.displayModal = false;
          $scope.events.push(newEvent);
          $scope.mytime = new Date();
          $scope.mytime.setHours(9, 0);
        })
        .catch(function(err){
          alert(err);
        });
    };
    /* remove event */
    $scope.remove = function(index) {
      var eventToDelete = $scope.events[index];
      var id = eventToDelete["_id"];
      // delete the record
      Calendar.delete(id)
        .then(function(response){
          // remove event from events array
          $scope.events.splice(index,1);

        })
        .catch(function(err){
          console.log("error: ", err);
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
        console.log(element);
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