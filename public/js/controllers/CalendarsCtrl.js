angular.module('CalendarsCtrl', []).controller('CalendarsCtrl', function($scope, $stateParams) {

    $scope.tagline = 'This is your calendar!!';
    $scope.calendarId = $stateParams.id;
    calendarId = $scope.calendarId;

    $scope.message = 'This is calendar ' + calendarId;   

});