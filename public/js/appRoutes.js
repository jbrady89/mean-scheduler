// public/js/appRoutes.js
angular.module('appRoutes', ["ui.router"]).config(function($stateProvider, $urlRouterProvider){
      
	      // For any unmatched url, send to /route1
	      $urlRouterProvider.otherwise("/");
	      //console.log($stateProvider);
	      //console.log($urlRouterProvider);
	      
	      $stateProvider
	        .state('home', {
	            url: "/",
	            templateUrl: "views/home.html",
	            controller: "MainCtrl"
	        })
	          
	        .state('trainers', {
	            url: "/trainers",
	            templateUrl: "views/trainers.html",
	            controller: 'TrainersCtrl'
	        })
	        
	        /*.state('trainers.about', {
	           parent: "trainers",
	           url: "/:id",
	           templateUrl: "views/trainers.about.html",
	           controller: "TrainersCtrl"
	        })*/

	        .state('trainers.calendar', {
	        	url: "/:id/calendar",
	        	templateUrl: "views/trainers.calendar.html",
	           	resolve: {
	           		CalendarService: 'Calendar',
	           		eventsData : function(CalendarService, $stateParams){
	           			//console.log(CalendarService);
	           			var id = $stateParams.id;
	           			return CalendarService.get(id);
	           		}
	           	},
	           	controller: "CalendarsCtrl"
	        })
	        .state('trainers.chat', {
	        	url: "/:id/chat",
	        	templateUrl: "views/trainers.chat.html",
	        	controller: "VideoChatCtrl"
	        })


	});
