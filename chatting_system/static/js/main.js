console.log('This is main.js !')


var mapPeers= {};

var usernameInput= document.querySelector('#username');
var btnJoin = document.querySelector('#btn-join');

var username;

var webSocket;

function webSocketOnMessage(event){
    var parseData= JSON.parse(event.data);
    var peerUsername = parseData['peer'];
    var action = parseData['action'];

    if (username == peerUsername){
        return;
    }

    var receiver_channel_name = parseData['message']['receiver_channel_name'];

    if (action == 'new-peer'){
        createOfferer(peerUsername, receiver_channel_name);
        return;
    }

    console.log('message: ', message);
}

btnJoin.addEventListener('click', ()=>{
    username= usernameInput.value;

    console.log('username:', username);

    if (username== ''){
        return ;
    }
    usernameInput.value= '';
    usernameInput.disabled= true;
    usernameInput.style.visibility= 'hidden';

    btnJoin.disabled= true;
    btnJoin.style.visibility= 'hidden';

    var labelUsername= document.querySelector('#label-username');
    labelUsername.innerHTML= username;

    var loc = window.location;
    var wsStart= 'ws://';
    if (loc.protocol == 'https:'){
        wsStart = 'wss://';
    }

    var endPoint = wsStart + loc.host + loc.pathname;

    console.log('endpoinst: ', endPoint);

    webSocket= new WebSocket(endPoint);

    webSocket.addEventListener('open', (e)=>{
        console.log('Connection Opened');

        sendSignal('new-peer', {})
    });
    webSocket.addEventListener('message', webSocketOnMessage);
    webSocket.addEventListener('close', (e)=>{
        console.log('Connection closed', )
    });
    webSocket.addEventListener('error',(e)=>{
        console.log('Error Occured')
    });
});


var localStream= new MediaStream();

const constraints= {
    'video': true,
    'audio': true
};

const localVideo= document.querySelector('#local-video');

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream =>{
        localStream= stream;
        localVideo.srcObject= localStream;
        localVideo.muted= false;
    })
    .catch(error=>{
        console.log('Error accessing media devices ', error);
    });




function sendSignal(action, message){
    var jsonStr= JSON.stringify({
        'peer': username,
        'action': action,
        "message":message,
    });
    webSocket.send(jsonStr);
}

function createOfferer(peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(null);
    addLocalTracks(peer);

    var dc= peer.createDataChannel('channel');
    dc.addEventListener('open', ()=>{
        console.log('connection opened !');
    });

    dc.addEventListener('message', dcOnMessage);

    var remoteVideo= createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    mapPeers[peerUsername] = [peer, dc];

    peer.addEventListener('iceconnectionstatechange', () =>{
        var iceConnectionState = peer.iceConnectionState;

        if(iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed'){
            delete mapPeers[peerUsername];
            if (iceConnectionState != 'closed'){
                peer.close();
            }
            removeVideo(remoteVideo);
        }
    })

}

function addLocalTracks(peer){
    localStream.getTracks().forEach(track=>{
        peer.addTrack(track, localStream);
    });
    return;
}

var messageList= document.querySelector('#message-list');
function dcOnMessage(event){
    var message= event.data;

    var li= document.createElement('li');
    li.appendChild(document.createTextNode(message));
    messageList.appendChild(li);
}

function createVideo(peerUsername){
    var videoContainer= document.querySelector('#video-container');
    var remoteVideo = document.createElement('video');

    remoteVideo.id= peerUsername + '-video';
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;

    var videoWrapper = document.createElement('div');
    videoContainer.appendChild(videoWrapper);
    
    videoWrapper.appendChild(remoteVideo);

    return remoteVideo;
}

function setOnTrack(peer, remoteVideo){
    var remoteStream = new MediaStream();

    remoteVideo.srcObject = remoteStream;

    peer.addEventListener('track', async (event)=>{
        remoteStream.addTrack(event.track, remoteStream);
    });
}

function removeVideo(Video){
    var videoWrapper= video.parentNode;

    videoWrapper.parentNode.removeChild(videoWrapper);
}