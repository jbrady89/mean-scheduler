angular.module("VideoChatCtrl", ["ui.bootstrap"]).controller("VideoChatCtrl", function($scope, $stateParams){

	//document.write("The Chat Controller");
	console.log("we made it to the chat view");
	var roomId = $stateParams.id;
	var socket = io.connect();
    socket.connect('http://127.0.0.1:1337');
    var localStream, localPeerConnection, remotePeerConnection;
	var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};


    socket.on("ready", function(data){
    	console.log('ready to start a call');
    });

    socket.on("full", function(data){
    	//alert('sorry this room is already full');
    });

    // disconnect when user leaves the view
    $scope.$on("$destroy", function(){
    	//localStream.stop();
    	//socket.disconnect();
    	//socket.emit("disconnect");
    });


	function trace(text) {
	  //console.log((performance.now() / 1000).toFixed(3) + ": " + text);
	}

	function gotStream(stream){
	  trace("Received local stream");
	  var localVideo = $('#localVideo')[0];
	  localVideo.src = URL.createObjectURL(stream);
	  localStream = stream;
	 //callButton.disabled = false;
	}

	$scope.start = function() {
	  trace("Requesting local stream");
	  startButton.disabled = true;
	  getUserMedia({audio:true, video:true}, gotStream,
	    function(error) {
	      trace("getUserMedia error: ", error);
	    });

	  socket.emit("join", "trainer" + roomId + "'s room");
	}

	$scope.endCall = function(){
		localStream.stop();
		$('#localVideo').attr('src', "");
	}

	$scope.call = function() {
		//callButton.disabled = true;
		//hangupButton.disabled = false;
		console.log("calling");
		trace("Starting call");

		if (localStream.getVideoTracks().length > 0) {
		trace('Using video device: ' + localStream.getVideoTracks()[0].label);
		}
		if (localStream.getAudioTracks().length > 0) {
		trace('Using audio device: ' + localStream.getAudioTracks()[0].label);
		}

		var servers = {
			iceServers: [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]
		};

		localPeerConnection = new RTCPeerConnection(servers);

		//trace("Created local peer connection object localPeerConnection");
		localPeerConnection.addStream(localStream);
		localPeerConnection.onicecandidate = gotLocalIceCandidate;
		localPeerConnection.onaddstream = gotRemoteStream;

		remotePeerConnection = new RTCPeerConnection(servers);
		console.log(remotePeerConnection);
		//trace("Created remote peer connection object remotePeerConnection");
		remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
		remotePeerConnection.onaddstream = gotRemoteStream;

		//trace("Added localStream to localPeerConnection");
		localPeerConnection.createOffer(gotLocalDescription,handleError);
		
		socket.on("candidate", function(candidate){
			rtcCandidate = new RTCIceCandidate(candidate);
			//console.log(rtcCandidate);
			localPeerConnection.addIceCandidate(rtcCandidate);
			console.log(localPeerConnection.addIceCandidate);
		});

		socket.on("offer", function(offer){
			console.log("we got an offer");
			console.log(offer);
			rtcOffer = new RTCSessionDescription(JSON.parse(offer));
			remotePeerConnection.setRemoteDescription(rtcOffer);
			remotePeerConnection.createAnswer(gotRemoteDescription,handleError);
		});

        socket.on("answer", function(answer){
        	console.log("we got an answer");
	    	var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
	    	remotePeerConnection.setRemoteDescription(rtcAnswer);
	    });
	}

	function gotLocalDescription(description){
		console.log("description:", description);
		localPeerConnection.setLocalDescription(description);
		// send the info back to the server
		socket.emit("offer", JSON.stringify(description));
		//trace("Offer from localPeerConnection: \n" + description.sdp);
		//rtcOffer = new RTCSessionDescription(JSON.parse(description));
		//remotePeerConnection.setRemoteDescription(rtcOffer);
		//remotePeerConnection.createAnswer(gotRemoteDescription,handleError);
	}

	function gotRemoteDescription(answer){
		console.log("we got an answer: " + answer);
	  remotePeerConnection.setLocalDescription(answer);
	  //trace("Answer from remotePeerConnection: \n" + description.sdp);
	  //localPeerConnection.setRemoteDescription(description);
	  socket.emit('answer', JSON.stringify(answer));
	}

	$scope.hangup = function hangup() {
	  trace("Ending call");
	  localPeerConnection.close();
	  remotePeerConnection.close();
	  localPeerConnection = null;
	  remotePeerConnection = null;
	  //hangupButton.disabled = true;
	  //callButton.disabled = false;
	}

	function gotRemoteStream(event){
	  console.log("we got the remote stream");
	  $remoteVideo = $('#remoteVideo')[0];
	  $remoteVideo.src = URL.createObjectURL(event.stream);
	  //trace("Received remote stream");
	  //console.log(event);
	}

	function gotLocalIceCandidate(event){
	  
	  console.log("we have a local ice candidate");
	  if (event.candidate) {
	    localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	    var candidate = event.candidate;
	    trace("Local ICE candidate: \n" + event.candidate.candidate);
	    socket.emit("candidate", candidate);
	  }
	}

	function gotRemoteIceCandidate(event){
		console.log("got remote ice candidate");
	  if (event.candidate) {
	  	console.log(event.candidate);
	  	var candidate = event.candidate;
	    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	    //trace("Remote ICE candidate: \n " + event.candidate.candidate);
	    socket.emit("candidate", candidate);
	  }
	}

	function handleError(error){
		console.log("there was an error:", error);
	}

});