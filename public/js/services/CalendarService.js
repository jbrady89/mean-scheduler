// public/js/services/NerdService.js
angular.module('CalendarService', []).factory('Calendar', ['$http', function($http, $stateParams) {
    console.log($stateParams);
    return {
        // call to get all sessions for the calendar

        get : function(id) {
            console.log(id);
            var url = "api/calendar/" + id;
            console.log(url);
            return $http.get(url);
        },


                // these will work when more API routes are defined on the Node side of things
        // call to POST and create a new nerd
        create : function(eventData) {
            return $http.post('/api/calendar', eventData);
        },

        // call to DELETE a session
        delete : function(id) {
            return $http.delete('/api/calendar/' + id);
        }
    };

}]);