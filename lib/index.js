"use strict";

import RTCMultiConnection from '../dist/RTCMulticonnection';
import { getHTMLMediaElement } from '../dev/getHTMLMediaElement';

var connection = null;
export class MindalayVideoConnection{
    constructor(options){
        this.options = options;
        this.InitConnection(options)    
    }
    InitConnection(options){
        connection = new RTCMultiConnection();
        connection.socketURL = 'https://vs.mindalay.com/';
        connection.enableLogs = false;
        connection.socketMessageEvent = options.roomId;
        connection.videosContainer = options.videoContainer;
    
        connection.session = {
            audio: options.isAudio ? true : false,
            video: options.isVideo ? true : false
        };

        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: options.isAudio ? true : false,
            OfferToReceiveVideo: options.isVideo ? true : false
        };
    
        connection.DetectRTC.load(function () {
            if (connection.DetectRTC.hasMicrophone === true) {
                connection.session.audio = true;
            }
    
            if (connection.DetectRTC.hasWebcam === true) {
                connection.session.video = true;
                var videoConstraints = {
                    width: {
                        ideal: options.videoWidth ? options.videoWidth : 355
                    },
                    height: {
                        ideal: options.videoHeight ? options.videoHeight : 200
                    },
                    frameRate: options.frameRate ? options.frameRate : 18
                };
                connection.mediaConstraints = {
                    video: videoConstraints,
                    audio: connection.session.audio
                };
            }
    
            if (connection.DetectRTC.hasSpeakers === false) {
                alert('Please attach a speaker device. You will unable to hear the incoming audios.');
            }
    
            // ratio = videoConstraints.width.ideal / videoConstraints.height.ideal;
        });
    
        connection.onstream = function (event) {
            var video = document.createElement('video');
            video.srcObject = event.stream;
            getVideoElement(event, video);
            var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
            if (event.type === 'local') {
                var mediaElement = getHTMLMediaElement(video, {
                    connectionId: event.streamid,
                    title: event.userid,
                    buttons: options.videoControls,
                    width: width,
                    showOnMouseEnter: false,
                    onMuted: onMuted,
                    onUnMuted: onUnMuted
                });
            }else{
                var mediaElement = getHTMLMediaElement(video, {
                    title: event.userid,
                    buttons: ['full-screen'],
                    width: width,
                    showOnMouseEnter: false,
                });
            }
    
            connection.videosContainer.appendChild(mediaElement);
    
            setTimeout(function() {
                mediaElement.media.play();
            }, 5000);
    
            mediaElement.id = event.streamid;
            localStorage.setItem(connection.socketMessageEvent, connection.sessionid);
    
            if(event.type === 'local') {
                connection.socket.on('disconnect', function() {
                  if(!connection.getAllParticipants().length) {
                    location.reload();
                  }
                });
            }
        };
        
        if (navigator.connection &&
            navigator.connection.downlink <= 0.115 && isInitialScreenReady) {
                alert("2G connection: slow internet connection")
        };
    
        connection.onstreamended = function(event) {
            var mediaElement = document.getElementById(event.streamid);
            if (mediaElement) {
                mediaElement.parentNode.removeChild(mediaElement);
            }
        };

        function getVideoElement(event, video) {
            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
            } catch (e) {
                video.setAttribute('autoplay', true);
                video.setAttribute('playsinline', true);
            };

            if (event.type === 'local') {
                video.volume = 0;
                try {
                    video.setAttributeNode(document.createAttribute('muted'));
                } catch (e) {
                    video.setAttribute('muted', true);
                };
            };
        }

        var onMuted = function onMuted(actionName){
            connection.attachStreams.forEach((stream) => {
                stream.getTracks().forEach((track) => {
                    if (track.readyState == 'live' && track.kind === actionName) {
                        track.enabled = false;
                    };
                });
            });
        }
    
        var onUnMuted = function  onUnMuted(actionName){
            connection.attachStreams.forEach((stream) => {
                stream.getTracks().forEach((track) => {
                    if (track.readyState == 'live' && track.kind === actionName) {
                        track.enabled = true;
                    };
                });
            });
        }
    }
    
    openOrJoin(button){
        document.getElementById(button).onclick = function() {
            disableInputButtons();
            connection.openOrJoin(connection.socketMessageEvent, function(isRoomExist, roomid, error) {
                if(error) {
                  disableInputButtons(true);
                  alert(error);
                }
                else if (connection.isInitiator === true) {
                    // if room doesn't exist, it means that current user will create the room
                    // showRoomURL(roomid);
                }
            });
        }
    
        var disableInputButtons = function disableInputButtons(enable) {
            document.getElementById('open-or-join-room').disabled = !enable;
        }
    }
}