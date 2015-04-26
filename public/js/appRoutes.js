// public/js/appRoutes.js
angular.module('appRoutes', ["ui.router"]).config(function($stateProvider, $urlRouterProvider){
      
	      // For any unmatched url, send to /route1
	      $urlRouterProvider.otherwise("/");
	      
	      $stateProvider
	        .state('home', {
	            url: "/",
	            templateUrl: "views/home.html",
	            controller: "MainCtrl"
	        })
	          
	        .state('trainers', {
	            url: "/trainers",
	            templateUrl: "views/trainers.html",
	            controller: "TrainersCtrl"
	        })
	        
	        .state('trainers.about', {
	           parent: "trainers",
	           url: "/:id",
	           templateUrl: "views/trainers.about.html",
	           controller: "TrainersCtrl"
	        })

	        .state('trainers.about.calendar', {
	        	parent: "trainers",
	        	url: "/:id/calendar",
	        	templateUrl: "views/trainers.calendar.html",
	           	controller: "CalendarsCtrl"
	        })


	});
