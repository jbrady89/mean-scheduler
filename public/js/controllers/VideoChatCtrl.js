angular.module("VideoChatCtrl", ["ui.bootstrap"]).controller("VideoChatCtrl", function($scope, $stateParams){

	//document.write("The Chat Controller");
	console.log("we made it to the chat view");
	var roomId = $stateParams.id;
	var socket = io.connect();
    socket.connect('http://127.0.0.1:1337');
    var localStream, peerConnection;
	var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};
	var peerKey = "sjln47ungrd7k3xr";


	var peer = new Peer({"key": peerKey});
	var myId,
		theirId;

	peer.on("open", function(id){
		console.log("my peer id is: ", id);
		socket.emit("newPeer", id);
		myId = id;
	});

	$scope.call = function(){
		console.log("we are initiating a call with user: ", theirId);
		var call = peer.call(theirId, localStream);

		// if we dont already have their stream
		// this will trigger a call on their end so we start getting it
		console.log($('#remoteVideo').prop('src'));
		if ($('#remoteVideo').prop('src') === "") socket.emit("call", myId);
	};

	peer.on("call", function(call){
		console.log("answering the call");
		call.answer(localStream);

		if (window.existingCall) {
	        window.existingCall.close();
	      }
	      // Wait for stream on the call, then set peer video display
	      call.on('stream', function(stream){
	        $('#remoteVideo').prop('src', URL.createObjectURL(stream));
	      });
	});

	socket.on("call", function(id){
		angular.element("#callButton").trigger('click');
	});

	socket.on("newPeer", function(id){
		theirId = id;
	});

    // disconnect when user leaves the view
    $scope.$on("$destroy", function(){
    	//localStream.stop();
    	//socket.disconnect();
    	//socket.emit("disconnect");
    });

	/*function trace(text) {
	  //console.log((performance.now() / 1000).toFixed(3) + ": " + text);
	}*/

	socket.on("ready", function(){
		alert("ready to start a call!");
	});

	function gotStream(stream){
	  trace("Received local stream");
	  var localVideo = $('#localVideo')[0];
	  localVideo.src = window.URL.createObjectURL(stream);
	  localStream = stream;
	  socket.emit("join", "trainer" + roomId + "'s room");
	  //socket.on("offer", function(offer){
	  //	console.log("this is our returned offer:", offer)

	  //});
	 //callButton.disabled = false;
	}

	$scope.start = function() {
	  trace("Requesting local stream");
	  startButton.disabled = true;
	  getUserMedia({audio:true, video:true}, gotStream,
	    function(error) {
	      trace("getUserMedia error: ", error);
	    });
	}

	$scope.endCall = function(){
		localStream.stop();
		$('#localVideo').attr('src', "");
	}	
/*
	var VideoChat = {

		

		requestMediaStream: function(event){
			console.log("hello");
		    getUserMedia(
		      {video: true, audio: true},
		      VideoChat.onMediaStream,
		      VideoChat.noMediaStream
		    );
		},

		onMediaStream: function(stream){
		    VideoChat.localVideo = document.getElementById('localVideo');
		    VideoChat.localStream = stream;
		    //VideoChat.videoButton.setAttribute('disabled', 'disabled');
		    VideoChat.localVideo.src = window.URL.createObjectURL(stream);
		    socket.emit('join', 'test');
		    socket.on('ready', console.log("ready to start a call!"));
		},

		noMediaStream: function(){
		    console.log("No media stream for us.");
		    // Sad trombone.
		},

		onCandidate : function(){
		    rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
		    VideoChat.peerConnection.addIceCandidate(rtcCandidate);

		},

		createOffer : function(){

		},

		onIceCandidate : function(){
			if(event.candidate){
			  console.log('Generated candidate!');
			  socket.emit('candidate', JSON.stringify(event.candidate));
			}
		}, 

		init: function(callback){
			return function(){
				console.log("calling");
				trace("Starting call");

				var servers = {
					iceServers: [{'url': 'stun:stun.l.google.com:19302'}]
				};

				VideoChat.peerConnection = new RTCPeerConnection(servers);
				VideoChat.peerConnection.onicecandidate = VideoChat.onIceCandidate;
				socket.on("candidate", VideoChat.onCandidate);
				peerConnection.addStream(localStream);

			}

		}
	}

	$scope.requestMediaStream = VideoChat.requestMediaStream;

		/*	peerConnection.createOffer(
				function(offer){
					peerConnection.setLocalDescription(offer);
					socket.emit("offer", JSON.stringify(offer));
				},
				function(err){
					console.log("error creating offer");
				}
			);
		}
		console.log("calling");
		trace("Starting call");

		var servers = {
			iceServers: [{'url': 'stun:stun.l.google.com:19302'}]
		};

		peerConnection = new RTCPeerConnection(servers);

		//trace("Created local peer connection object localPeerConnection");
		peerConnection.onicecandidate = gotIceCandidate;
		peerConnection.onaddstream = gotRemoteStream;
		peerConnection.addStream(localStream);
		peerConnection.createOffer(
			function(offer){
				peerConnection.setLocalDescription(offer);
				socket.emit("offer", JSON.stringify(offer));
			},
			function(err){
				console.log("error creating offer");
			}
		);
		trace("Added localStream to localPeerConnection");
		//peerConnection.createOffer(gotLocalDescription,handleError);
		
		socket.on("candidate", function(candidate){
			rtcCandidate = new RTCIceCandidate(candidate);
			//console.log(rtcCandidate);
			peerConnection.addIceCandidate(rtcCandidate);
			//console.log(localPeerConnection.addIceCandidate);
		});

		socket.on("offer", function(offer){
			console.log("we got an offer");
			console.log(offer);
			rtcOffer = new RTCSessionDescription(JSON.parse(offer));
			peerConnection.setRemoteDescription(rtcOffer);
			peerConnection.createAnswer(function(answer){
				peerConnection.setLocalDescription(answer);
				socket.emit("answer", amswer);
			});
		});

        socket.on("answer", function(answer){
        	console.log("we got an answer");
	    	rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
	    	peerConnection.setRemoteDescription(rtcAnswer);
	    });
	}

	function gotLocalDescription(description){
		console.log("description:", description);
		peerConnection.setLocalDescription(description);
		// send the info back to the server
		socket.emit("offer", JSON.stringify(description));
		//trace("Offer from localPeerConnection: \n" + description.sdp);
		//rtcOffer = new RTCSessionDescription(JSON.parse(description));
		//remotePeerConnection.setRemoteDescription(rtcOffer);
		//remotePeerConnection.createAnswer(gotRemoteDescription,handleError);
	}

	function gotRemoteDescription(answer){
		console.log("we got an answer: " + answer);
	    peerConnection.setLocalDescription(answer);
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
	  console.log(event.stream);
	  $remoteVideo.src = window.URL.createObjectURL(event.stream);
	  //trace("Received remote stream");
	  //console.log(event);
	}

	function gotIceCandidate(event){
	  
	  console.log("we have a local ice candidate");
	  if (event.candidate) {
	    peerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
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
	    peerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	    //trace("Remote ICE candidate: \n " + event.candidate.candidate);
	    socket.emit("candidate", candidate);
	  }
	}

	function handleError(error){
		console.log("there was an error:", error);
	}*/



	/*** a working version ***/
	/*
	var connection = new RTCMultiConnection();
        connection.session = {
            audio: true,
            video: true
        };
        connection.onstream = function(e) {
            e.mediaElement.width = 600;
            videosContainer.insertBefore(e.mediaElement, videosContainer.firstChild);
            //rotateVideo(e.mediaElement);
            //scaleVideos();
        };
        
        connection.onstreamended = function(e) {
            e.mediaElement.style.opacity = 0;
            //rotateVideo(e.mediaElement);
            setTimeout(function() {
                if (e.mediaElement.parentNode) {
                    e.mediaElement.parentNode.removeChild(e.mediaElement);
                }
                //scaleVideos();
            }, 1000);
        };

        var sessions = {};
        connection.onNewSession = function(session) {
            if (sessions[session.sessionid]) return;
            sessions[session.sessionid] = session;
            var tr = document.createElement('tr');
            tr.innerHTML = '<td><strong>' + session.extra['session-name'] + '</strong> is running a conference!</td>' +
                '<td><button class="join">Join</button></td>';
            roomsList.insertBefore(tr, roomsList.firstChild);
            var joinRoomButton = tr.querySelector('.join');
            joinRoomButton.setAttribute('data-sessionid', session.sessionid);
            
            joinRoomButton.onclick = function() {
                this.disabled = true;
                var sessionid = this.getAttribute('data-sessionid');
                session = sessions[sessionid];
                if (!session) throw 'No such session exists.';
                connection.join(session);
            };
        };

        var videosContainer = document.getElementById('videos-container') || document.body;
        var roomsList = document.getElementById('rooms-list');
        document.getElementById('setup-new-conference').onclick = function() {
        	console.log("click");
            this.disabled = true;
            connection.extra = {
                'session-name': document.getElementById('conference-name').value || 'Anonymous'
            };
            connection.open();
        };

        // setup signaling to search existing sessions
        connection.connect();
        /*(function() {
            var uniqueToken = document.getElementById('unique-token');
            if (uniqueToken)
                if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
                else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
        })();*/
});