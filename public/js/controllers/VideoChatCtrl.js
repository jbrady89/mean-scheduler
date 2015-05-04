angular.module("VideoChatCtrl", ["ui.bootstrap"]).controller("VideoChatCtrl", function($scope){

	//document.write("The Chat Controller");
	console.log("we made it to the chat view");

	var socket = io.connect();
    socket.connect('http://127.0.0.1:1337');

    // when user joins the view
    socket.on("connect", function(socket){
    	console.log("new socket: " + socket);
    });

    // disconnect when user leaves the view
    $scope.$on("$destroy", function(){
    	localStream.stop();
    	socket.disconnect();
    	socket.emit("disconnect");
    });

	var localStream, localPeerConnection, remotePeerConnection;


	function trace(text) {
	  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
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

	  socket.emit("join", "test");
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

	  var servers = null;

	  localPeerConnection = new RTCPeerConnection(servers);
	  trace("Created local peer connection object localPeerConnection");
	  localPeerConnection.onicecandidate = gotLocalIceCandidate;

	  remotePeerConnection = new RTCPeerConnection(servers);
	  trace("Created remote peer connection object remotePeerConnection");
	  remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	  remotePeerConnection.onaddstream = gotRemoteStream;

	  localPeerConnection.addStream(localStream);
	  trace("Added localStream to localPeerConnection");
	  localPeerConnection.createOffer(gotLocalDescription,handleError);
	}

	function gotLocalDescription(description){
	  localPeerConnection.setLocalDescription(description);
	  trace("Offer from localPeerConnection: \n" + description.sdp);
	  remotePeerConnection.setRemoteDescription(description);
	  remotePeerConnection.createAnswer(gotRemoteDescription,handleError);
	}

	function gotRemoteDescription(description){
	  remotePeerConnection.setLocalDescription(description);
	  trace("Answer from remotePeerConnection: \n" + description.sdp);
	  localPeerConnection.setRemoteDescription(description);
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
	  remoteVideo.src = URL.createObjectURL(event.stream);
	  trace("Received remote stream");
	  console.log(event);
	}

	function gotLocalIceCandidate(event){
	  console.log(event);
	  if (event.candidate) {
	    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	    trace("Local ICE candidate: \n" + event.candidate.candidate);
	  }
	}

	function gotRemoteIceCandidate(event){
	  if (event.candidate) {
	    localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	    trace("Remote ICE candidate: \n " + event.candidate.candidate);
	  }
	}

	function handleError(){}

});