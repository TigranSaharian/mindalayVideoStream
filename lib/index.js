"use strict";

import RTCMultiConnection from '../dist/RTCMulticonnection';
import { getHTMLMediaElement } from '../dev/getHTMLMediaElement';

// video quality
const MIN_WIDTH = 640;
const MIN_HEIGHT = 360;
const MIN_FRAME_RATE = 15;
var connection = null;
var ratio = 0;
var videoConstraints = {};

export class RtcConnection{
    constructor(options){
        this.options = options;
        this.connection = connection;
        this.InitConnection(this.options);
    }
    
    InitConnection(options){
        connection = new RTCMultiConnection();
        this.connection = connection;
        connection.socketURL = 'https://vs.mindalay.com/';
        connection.enableLogs = false;
        connection.socketMessageEvent = options.roomId;
        connection.videosContainer = options.mediaContainer;
        
        connection.iceServers = [{
            'urls': [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun.l.google.com:19302?transport=udp',
            ]
        }];


        if(options.isScreenShare){
            connection.session = {
                oneway: true,
                screen: true,
                audio: options.isAudio
            };
        }else{
            connection.session = {
                audio: options.isAudio,
                video: options.isVideo,
            };
        }

        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: options.isScreenShare ? false : options.isAudio,
            OfferToReceiveVideo: options.isScreenShare ? false : options.isVideo
        };

        if(!options.isScreenShare){
            connection.mediaConstraints = {
                audio: options.isAudio,
                video: options.isVideo
            };
            
            connection.DetectRTC.load(function () {
                if (connection.DetectRTC.hasMicrophone === true) {
                    connection.session.audio = options.isAudio;
                }
        
                if(options.isVideo){
                    if (connection.DetectRTC.hasWebcam === true) {
                        connection.session.video = options.isVideo;
                        if(options.videoWidth && options.videoHeight){
                            ratio = options.videoWidth / options.videoHeight;
                        }else{
                            ratio = MIN_WIDTH / MIN_HEIGHT;
                        }
                        videoConstraints = setStreamQuality(MIN_WIDTH, options.videoWidth, MIN_HEIGHT, options.videoHeight, MIN_FRAME_RATE, options.frameRate, ratio);
                        connection.mediaConstraints = {
                            video: videoConstraints,
                            audio: options.isAudio
                        };
                    }else{
                        alert('Please attach a camera device.');
                        connection.mediaConstraints.video = false;
                        connection.session.video = false;
                    }
                }
                
                if (connection.DetectRTC.hasSpeakers === false) {
                    alert('Please attach a speaker device. You will unable to hear the incoming audios.');
                }
            });
        }

        let localMediaElement = null;
        connection.onstream = function (event) {
            let existing = document.getElementById(event.streamid);
            if(existing && existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }

            if(options.isVideo && !options.isScreenShare){
                let video = document.createElement('video');
                getVideoElement(event, video);
                
                video.srcObject = event.stream;
                if(event.type === 'local'){
                    localMediaElement = getHTMLMediaElement(video, {
                        buttons: options.videoControls,
                        showOnMouseEnter: false,
                        width: options.width,
                        container: options.mediaContainer,
                        type: event.type,
                        onMuted: mute,
                        onUnMuted: unMute,
                        onStope: stop
                    });
                    localMediaElement.id = event.streamid;
                    localMediaElement.classList.add('local-stream');
                    localMediaElement.querySelector('.media-box').remove();
                }else{
                    var mediaElement = getHTMLMediaElement(video, {
                        buttons: [],
                        type: event.type,
                        width: options.width,
                        showOnMouseEnter: false,
                    });
                    mediaElement.prepend(localMediaElement);
                    mediaElement.classList.add('remote-stream');
                }
            }else if(options.isAudio && !options.isScreenShare){
                if(event.type === 'local'){
                    localMediaElement = getHTMLMediaElement(event.mediaElement, {
                        buttons: options.videoControls,
                        showOnMouseEnter: false,
                        width: options.width,
                        type: event.type,
                        container: options.mediaContainer,
                        onMuted: mute,
                        onUnMuted: unMute,
                    });
                    localMediaElement.id = event.streamid;
                    localMediaElement.classList.add('local-stream');
                    localMediaElement.querySelector('.media-box').remove();
                }else{
                    var mediaElement = getHTMLMediaElement(event.mediaElement, {
                        buttons: [],
                        type: event.type,
                        width: options.width,
                        showOnMouseEnter: false,
                        container: options.mediaContainer,
                        onStope: stop
                    });
                    mediaElement.prepend(localMediaElement);
                    mediaElement.classList.add('remote-stream');
                }
            }else if(options.isAudio && options.isScreenShare){
                let video = document.createElement('video');
                getVideoElement(event, video);
                video.srcObject = event.stream;
                mediaElement = getHTMLMediaElement(video, {
                    buttons: options.mediaControls,
                    width: options.width,
                    type: event.type,
                    container: options.mediaContainer,
                    showOnMouseEnter: false,
                    isScreenShare: true,
                    onMuted: mute,
                    onUnMuted: unMute,
                    onStope: stop,
                    // onStopClientScreenShare: stopClientScreenShare
                });
                mediaElement.id = event.streamid;
                mediaElement.classList.add('remote-stream');
            }
            
            mediaElement && connection.videosContainer.appendChild(mediaElement);

            setTimeout(function() {
                mediaElement && mediaElement.media.play();
            }, 5000);

            if(mediaElement) mediaElement.id = event.streamid;

            if(event.type === 'local') {
                
                // connection.socket.on('disconnect', function() {
                //     // if(options.isScreenShare){
                //     //     stopClientScreenShare()
                //     // }
                //     // stop();
                //     //console.log(11111111111111111);
                // });
            }
        };
        
        if (navigator.connection && navigator.connection.downlink <= 0.115) {
                alert("2G connection: slow internet connection")
        };

        connection.onstreamended = function(event) {
            var mediaElement = document.getElementById(event.streamid);
            if (mediaElement) {
                mediaElement.parentNode.removeChild(mediaElement);
                stop();
                // if(options.isScreenShare){
                //     stopClientScreenShare();
                // }
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

        function setStreamQuality(minWidth, maxWidth, minHeight, maxHeight, minFrameRate, maxFrameRate, maxAspetRatio) {
            if (connection.DetectRTC.browser.name !== 'Firefox') {
                connection.mediaConstraints = {
                    audio: true,
                    video: {
                        width: {
                            ideal: maxWidth
                        },
                        height: {
                            ideal: maxHeight
                        },
                        frameRate: {
                            min: minFrameRate,
                            max: maxFrameRate
                        },
                        aspectRatio: maxAspetRatio,
                        facingMode: 'user' // or "application"
                    }
                };
                return connection.mediaConstraints.video;
            } else {
                connection.mediaConstraints = {
                    audio: true,
                    video: {
                        mandatory: {
                            minWidth: minWidth,
                            maxWidth: maxWidth,
                            minHeight: minHeight,
                            maxHeight: maxHeight,
                            minFrameRate: minFrameRate,
                            maxFrameRate: maxFrameRate,
                            minAspectRatio: 1.77,
                            aspectRatio: maxAspetRatio
                        },
                        optional: [{
                            facingMode: 'user' // or "application"
                        }]
                    }
                };
                return connection.mediaConstraints.video.mandatory;
            }
        }

        var mute = function onMuted(actionName){
            connection.attachStreams.forEach((stream) => {
                stream.getTracks().forEach((track) => {
                    if (track.readyState == 'live' && track.kind === actionName) {
                        track.enabled = false;
                    };
                });
            });
        }
        
        var unMute = function  onUnMuted(actionName){
            connection.attachStreams.forEach((stream) => {
                stream.getTracks().forEach((track) => {
                    if (track.readyState == 'live' && track.kind === actionName) {
                        track.enabled = true;
                    };
                });
            });
        }

        var stop = function onStopStream(){
            // disconnect with all users
            connection.getAllParticipants().forEach(function(pid) {
                connection.disconnectWith(pid);
            });

            // stop all local cameras
            connection.attachStreams.forEach(function(localStream) {
                localStream.stop();
            });

            // close socket.io connection
            connection.closeSocket();
        }

        var stopClientScreenShare = function onStopClientScreenShare(){
            options.signalR.invoke('HangupCall', options.roomId, 3, 1, +options.userId).catch((error) => {
                console.log(error);
            })
        }
    }

    closeRoom(){
        // disconnect with all users
        connection.getAllParticipants().forEach(function(pid) {
            connection.disconnectWith(pid);
        });

        // stop all local cameras
        connection.attachStreams.forEach(function(localStream) {
            localStream.stop();
        });

        // close socket.io connection
        connection.closeSocket();
    }

    openRoom(){
        connection.open(connection.socketMessageEvent);
    }

    joinRoom(){
        connection.join(connection.socketMessageEvent);
    }
}