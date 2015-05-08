angular.module("VideoChatCtrl", ["ui.bootstrap"]).controller("VideoChatCtrl", function($scope, $stateParams){

	//document.write("The Chat Controller");
	console.log("we made it to the chat view");
	var trainerId = $stateParams.id;
	var socket = io.connect();
    socket.connect('http://127.0.0.1:1337');
    var localStream, peerConnection;
	var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

	var localVideo;
	var remoteVideo;
	var peerConnection;
	var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

	function getUserMediaSuccess(stream) {
	    localStream = stream;
	    localVideo.src = window.URL.createObjectURL(stream);
	}

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
	        socket.emit('message', JSON.stringify(description) );
	    }, function() {console.log('set description error')});
	}

	function gotIceCandidate(event) {
	    if(event.candidate != null) {
	        socket.emit('message', JSON.stringify(event.candidate));
	    }
	}

	function gotRemoteStream(event) {
	    console.log("got remote stream");
	    remoteVideo.src = window.URL.createObjectURL(event.stream);
	}

	function createOfferError(error) {
	    console.log(error);
	}

	function createAnswerError(error){
		console.log(error);
	}

	function pageReady() {
	    localVideo = document.getElementById('localVideo');
	    remoteVideo = document.getElementById('remoteVideo');

	    socket.on("message", function(message){
	    	if(!peerConnection) {
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
			            	socket.emit("message", JSON.stringify(answer) );

			            }, 
			            function (err){
			            	console.log(err);
			     		});
			        });
			    }
			} else if (signal.candidate) {
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
	        getUserMedia(constraints, getUserMediaSuccess, getUserMediaError);
	    } else {
	        alert('Your browser does not support getUserMedia API');
	    }

	};

	$scope.$on('destroy', function(){
		socket.disconnect();
	});

	// tell the other person we're here
	socket.emit("join", "Trainer " + trainerId + "'s room");

	socket.on("ready", function(){
		console.log("ready to start a call!");
		pageReady();
	});

});