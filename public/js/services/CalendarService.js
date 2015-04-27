// public/js/services/NerdService.js
angular.module('CalendarService', []).factory('Calendar', ['$http', function($http) {

    return {
        // call to get all sessions for the calendar

        get : function(trainerInfo) {

            return $http.get('/api/calendar', {params: trainerInfo });
        },


                // these will work when more API routes are defined on the Node side of things
        // call to POST and create a new nerd
        create : function(eventData) {
            return $http.post('/api/calendar', eventData);
        },

        // call to DELETE a session
        delete : function(eventId) {
            return $http.delete('/api/calendar/', eventId);
        }
    };

}]);