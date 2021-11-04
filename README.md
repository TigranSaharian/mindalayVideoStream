# What is this?

many to many video streaming

# Instolation

`npm i mindalayvideostream --save`

# inital

```
import { MindalayVideoConnection } from "mindalayvideostream";
```

## *React*
```
<videoConnection 
    roomId='roomid_123'
    videoContainer= {document.getElementById("container")}
    isAudio= {true}
    isVideo ={true}
    videoWidth= {1920}
    videoHeight= {1080}
    frameRate= {30}
    videoControls={[ 'mute-audio', 'mute-video', 'full-screen'] } 
/>
```

* *videoConnection component* 
```
const connection = new MindalayVideoConnection({
    roomId, videoContainer, isAudio, isVideo, videoWidth, videoHeight, frameRate, videoControls
});


create any button and take the id

useEffect(()=>{
    connection.openOrJoin("open-or-join-room")
},[connection])
```
## *JavaScript*
```
var connectin = new MindalayVideoConnection({
    roomId: 'roomid_123',
    videoContainer: document.getElementById('container'),
    isAudio: true,
    isVideo: true,
    videoWidth: 1920,
    videoHeight: 1080,
    frameRate: 30,
    videoControls: [
        'mute-audio', 'mute-video', 'full-screen'
    ]
});

connectin.openOrJoin('open-or-join-room');
```

## Options

* *roomId* - any unique id (typeof string)
* *videoContainer* - take the HTML element | document.getElementById('elementId')
* *isAudio* - true | false
* *isVideo* - true | false
* *videoControls* - 'mute-audio','mute-video','full-screen',
                    'take-snapshot','record-audio','record-video',
                    'volume-slider','stop'