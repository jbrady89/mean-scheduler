// public/js/controllers/NerdCtrl.js
angular.module('TrainersCtrl', []).controller('TrainersCtrl', function($scope, $stateParams, $state, Trainers) {
	console.log("trainers sref clicked");
    //$scope.tagline = 'view our trainers!';
    //$scope.trainerId = $stateParams.id;

    // trainer info 
    $scope.trainers = Trainers.trainersData;
});