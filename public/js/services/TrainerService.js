angular.module('TrainerService', []).factory('Trainers', ['$http', function($http, $stateParams) {
    console.log($stateParams);

    return {
        // call to get all sessions for the calendar

        trainersData : [
                        {
                            "id": "1",
                            "name": "Jon",
                            "description": "This is my description!"
                        },
                        {
                            "id": "2",
                            "name": "Edward",
                            "description": "This is my description!"
                        },
                        {
                            "id": "3",
                            "name": "Eric",
                            "description": "This is my description!"
                        }
                    ]
    };

}]);