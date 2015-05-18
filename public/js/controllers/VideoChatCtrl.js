angular.module("VideoChatCtrl", ["ui.bootstrap"]).controller("VideoChatCtrl", function($location, $scope, $q, $stateParams, $state){

	//document.write("The Chat Controller");
	console.log("we made it to the chat view");
	var trainerId = $stateParams.id;
	$scope.trainerId = trainerId;
	var socket = io.connect();
    socket.connect('http://127.0.0.1:1337');
    $scope.streaming = false;
    $scope.roomFull = false;
    var localStream;
	var localVideo;
	var remoteVideo;
	var peerConnection;
	var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

	function getUserMediaSuccess(stream) {
	    localStream = stream;
	    localVideo.src = window.URL.createObjectURL(stream);
	    $scope.$apply(function(){
	        $scope.streaming = true;

	    });
	}

	$scope.isActive = function(viewLocation){
		
		
		return viewLocation === $location.path();
	};

	function getUserMediaError(error) {
	    console.log(error);
	}

	$scope.start = function(isCaller) {

	    peerConnection = new RTCPeerConnection(peerConnectionConfig);
	    peerConnection.onicecandidate = gotIceCandidate;
	    peerConnection.onaddstream = gotRemoteStream;
	    peerConnection.addStream(localStream);

	    if(isCaller) {
	    	
	        peerConnection.createOffer(gotDescription, createOfferError);
	    }

	}

	function gotDescription(description) {
	    console.log('got description');
	    peerConnection.setLocalDescription(description, function () {
	        socket.emit('message', {room: trainerId, message: JSON.stringify(description) });
	    }, function() {console.log('set description error')});
	}

	function gotIceCandidate(event) {
	    if(event.candidate != null) {
	        socket.emit('message', {room: trainerId, message: JSON.stringify(event.candidate)});
	    }
	}

	function gotRemoteStream(event) {
	    console.log("got remote stream");
	    //console.log(event);
	    remoteStream = event.stream;
	    remoteVideo.src = window.URL.createObjectURL(event.stream);
	}

	function createOfferError(error) {
	    console.log(error);
	}

	function createAnswerError(error){
		console.log(error);
	}

	var localVideo = document.getElementById('localVideo');
	var remoteVideo = document.getElementById('remoteVideo');
	$scope.pageReady = function pageReady() {
		//console.log(localStream);
		if (localStream == undefined || localStream.active == false){
		    

		    socket.on("message", function(message){
		    	console.log(message);
		    	if(!peerConnection || peerConnection.signalingState == "closed") {
		    		$scope.start(false);
		    	}

			    var signal = JSON.parse(message);
			   
			    if(signal.sdp) {

			    	if (signal["type"] == "answer"){
			    		var rtcAnswer = new RTCSessionDescription(signal);
	    				peerConnection.setRemoteDescription(rtcAnswer, function(){
	    					console.log("remote description has been set");
	    				}, function(err){
	    					console.log("there was an error setting the description");
	    				});
			    	} 

			    	if (signal["type"] == "offer") {
			    		
			    	//console.log("signal is SDP");
			    	//console.log(signal.sdp)
				    	var rtcOffer = new RTCSessionDescription( signal );
				        peerConnection.setRemoteDescription( rtcOffer , function() {
				            peerConnection.createAnswer(function(answer){
				            	console.log("answer has been sent");
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
			    	console.log("signal is ICE");
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
		        	console.log("we're streaming");

		        		$scope.streaming = true;

		        })
		        .catch(function(err){
		        	console.log(err);
		        });

		    } else {
		        alert('Your browser does not support getUserMedia API');
		    }
		}
	}

	var stopStreaming = function(){
		var defer = $q.defer();
		defer.resolve(localStream.stop());
		return defer.promise;
	}

	$scope.hangUp = function hangUp() {

		
			
		// if the local stream is running,
		// stop the local and remote streams
		if (localStream.active == true){

			console.log('hanging up now');

			stopStreaming()
			.then(function(){
				peerConnection.close();
				$scope.streaming = false;			
				//console.log(localStream.ended);
				console.log("the stream was stopped");
				socket.emit("endCall", {room: trainerId});
			});
			
			
		} else {
			console.log("stream has ended");
			$scope.streaming = false;

			$('#remoteVideo').prop("src", "");
		}
	}



	$scope.$on('destroy', function(){
		console.log("navigated away");
	});

	socket.on('endCall', function(data){
		//console.log(message);
		console.log("166: the other user hung up");
		$scope.hangUp();
		//$('#remoteStream').fadeOut(500);
		$('#remoteVideo').prop("src", "");
		//socket.emit("endCall", "stream has ended");
		
	});

	// tell the other person we're here
	socket.emit("join", trainerId);

	socket.on("ready", function(){
		console.log("ready to start a call!");
		$scope.$apply(function(){
			$scope.roomFull = true;

		});
		//pageReady();
	});

	$scope.$on("$stateChangeStart", function(){
		//alert("leaving room");
		var room = trainerId;
		socket.emit("leave", room);
		$scope.hangUp();
	});



	socket.on("leave", function(room){
		console.log(room);

		$scope.$apply(function(){
			$scope.roomFull = false;

		});
	});

});