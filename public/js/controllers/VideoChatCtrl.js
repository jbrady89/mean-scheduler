angular.module("VideoChatCtrl", ["ui.bootstrap"]).controller("VideoChatCtrl", function($scope){

	//document.write("The Chat Controller");
	console.log("we made it to the chat view");
	var localStream, localPeerConnection, remotePeerConnection;


	function trace(text) {
	  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
	}

	function gotStream(stream){
	  trace("Received local stream");
	  var localVideo = $('#localVideo')[0];
	  localVideo.src = URL.createObjectURL(stream);
	  localStream = stream;
	  callButton.disabled = false;
	}

	$scope.start = function() {
	  trace("Requesting local stream");
	  startButton.disabled = true;
	  getUserMedia({audio:true, video:true}, gotStream,
	    function(error) {
	      trace("getUserMedia error: ", error);
	    });
	}
	

	/*$scope.hangUp = function(){
		console.log("stopping the stream");
		window.stream.stop();
		$('#localStream').attr('src', "");
	}*/
});