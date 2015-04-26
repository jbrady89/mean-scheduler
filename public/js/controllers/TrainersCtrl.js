// public/js/controllers/NerdCtrl.js
angular.module('TrainersCtrl', ['CalendarService']).controller('TrainersCtrl', function($scope, $stateParams) {

    $scope.tagline = 'view our trainers!';
    $scope.trainerId = $stateParams.id;

});