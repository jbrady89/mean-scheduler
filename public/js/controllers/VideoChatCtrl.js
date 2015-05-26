angular.module("VideoChatCtrl", ["ui.bootstrap"]).controller("VideoChatCtrl", function($location, $scope, $q, $stateParams, $state){

	var trainerId = $stateParams.id;
	$scope.trainerId = trainerId;

	var socket = io.connect();
    socket.connect('http://127.0.0.1:1337');


    // setting the active tab
	$scope.isActive = function(viewLocation){
		
		
		return viewLocation === $location.path();
	};

	// exposes three methods: init, start, stop
	$scope.VideoChat = (function (){

		$scope.streaming = false;
	    $scope.roomFull = false;
	    var localStream,
			peerConnection,
			peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]},
			localVideo = document.getElementById('localVideo'),
			remoteVideo = document.getElementById('remoteVideo');

		var getUserMediaSuccess = function getUserMediaSuccess(stream) {
		    localStream = stream;
		    localVideo.src = window.URL.createObjectURL(stream);
		    $scope.$apply(function(){
		        $scope.streaming = true;

		    });
		};

		var getUserMediaError = function getUserMediaError(error) {
		    console.log(error);
		};

		// private methods
		var gotDescription = function gotDescription(description) {
		    //console.log('got description');
		    peerConnection.setLocalDescription(
		    	description, 
		    	function () {
		        	socket.emit('message', {room: trainerId, message: JSON.stringify(description) });
		    	}, function() {
		    		console.log('set description error');
		    	}
			);
		};

		var gotIceCandidate = function gotIceCandidate(event) {
		    if(event.candidate !== null) {
		        socket.emit('message', {room: trainerId, message: JSON.stringify(event.candidate)});
		    }
		};

		var gotRemoteStream = function gotRemoteStream(event) {
		    //console.log("got remote stream");
		    //console.log(event);
		    remoteStream = event.stream;
		    remoteVideo.src = window.URL.createObjectURL(event.stream);
		};

		var createOfferError = function createOfferError(error) {
		    console.log(error);
		};

		var createAnswerError = function createAnswerError(error){
			console.log(error);
		};

		var stopStreaming = function stopStreaming(){
			var defer = $q.defer();
			defer.resolve(localStream.stop());
			return defer.promise;
		};

		var start = function start(isCaller) {

		    peerConnection = new RTCPeerConnection(peerConnectionConfig);
		    peerConnection.onicecandidate = gotIceCandidate;
		    peerConnection.onaddstream = gotRemoteStream;
		    peerConnection.addStream(localStream);

		    if(isCaller) {
		    	
		        peerConnection.createOffer(gotDescription, createOfferError);
		    }

		};

		var pageReady = function pageReady() {
		//console.log(localStream);
			if (localStream === undefined || localStream.active === false){
			    

			    socket.on("message", function(message){
			    	if(!peerConnection || peerConnection.signalingState == "closed") {
			    		start(false);
			    	}

				    var signal = JSON.parse(message);
				   
				    if(signal.sdp) {

				    	if (signal.type === "answer"){
				    		var rtcAnswer = new RTCSessionDescription(signal);
		    				peerConnection.setRemoteDescription(rtcAnswer, function(){
		    					console.log("remote description has been set");
		    				}, function(err){
		    					console.log("there was an error setting the description");
		    				});
				    	} 

				    	if (signal.type === "offer") {
				    		
				    	//console.log("signal is SDP");
				    	//console.log(signal.sdp)
					    	var rtcOffer = new RTCSessionDescription( signal );
					        peerConnection.setRemoteDescription( rtcOffer , function() {
					            peerConnection.createAnswer(function(answer){
					            	//console.log("answer has been sent");
					            	peerConnection.setLocalDescription(answer);
					            	socket.emit("message", {room: trainerId, message: JSON.stringify(answer) } );

					            }, 
					            function (err){
					            	console.log(err);
					     		});
					        });
					    }
					} else if (signal.candidate) {
						//console.log(peerConnection);
				    	//console.log("signal is ICE");
				    	iceCandidate = signal;
				        peerConnection.addIceCandidate( new RTCIceCandidate( signal ) );
					} 
				});

				var constraints = {
			        video: true,
			        audio: true,
			    };

			    if(getUserMedia) {

			        var startStreaming = new Promise(function(resolve, reject){
			        	resolve(getUserMedia(constraints, getUserMediaSuccess, getUserMediaError));
			        });

			        startStreaming.then(function(){
			        	//console.log("we're streaming");

			        		$scope.streaming = true;

			        })
			        .catch(function(err){
			        	console.log(err);
			        });

			    } else {
			        alert('Your browser does not support getUserMedia API');
			    }
			}
		};

		var hangUp = function hangUp() {

		// if the local stream is running,
		// stop the local and remote streams
			if (localStream.active === true){

				//console.log('hanging up now');

				stopStreaming()
				.then(function(){
					peerConnection.close();
					$scope.streaming = false;			
					//console.log(localStream.ended);
					//console.log("the stream was stopped");
					socket.emit("endCall", {room: trainerId});
				});
				
				
			} else {
				//console.log("stream has ended");
				$scope.streaming = false;

				$('#remoteVideo').prop("src", "");
			}
		};

		return {
			start : start,
			init : pageReady,
			stop : hangUp

		};
	}());

	socket.on('endCall', function(data){
		//console.log(message);
		//console.log("166: the other user hung up");
		$scope.VideoChat.stop();
		//$('#remoteStream').fadeOut(500);
		$('#remoteVideo').prop("src", "");
		//socket.emit("endCall", "stream has ended");
		
	});

	// tell the other person we're here
	socket.emit("join", trainerId);

	socket.on("ready", function(){
		//console.log("ready to start a call!");
		$scope.$apply(function(){
			$scope.roomFull = true;

		});
		//pageReady();
	});

	$scope.$on("$stateChangeStart", function(){
		//alert("leaving room");
		var room = trainerId;
		socket.emit("leave", room);
		$scope.VideoChat.stop();
	});



	socket.on("leave", function(room){
		//console.log(room);

		$scope.$apply(function(){
			$scope.roomFull = false;

		});
	});

});