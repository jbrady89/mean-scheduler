// public/js/services/NerdService.js
angular.module('CalendarService', []).factory('CalendarService', ['$http', function($http) {

    return {
        // call to get all sessions for the calendar

        get : function(calendarId) {

            return $http.get('/api/calendar', calendarId);
        },


                // these will work when more API routes are defined on the Node side of things
        // call to POST and create a new nerd
        create : function(sessionData) {
            return $http.post('/api/calendar', sessionData);
        },

        // call to DELETE a session
        delete : function(calendarId) {
            return $http.delete('/api/calendar/' + calendarId);
        }
    };

}]);