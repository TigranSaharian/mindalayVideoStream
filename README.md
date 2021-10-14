# What is this?

many to many video streaming

# Instolation

`npm i m-videostream`

Then...

```
import { mindalayVideoStream } from 'mindalayVideoStream';

mindalayVideoStream({
    roomId: 'roomid_123',
    videoContainer: 'myVideoContainerInBody',
    isAudio: true,
    isVideo: true,
    videoWidth: 1920,
    videoHeight: 1080,
    frameRate: 30,
    videoControls: [
        'mute-audio', 'mute-video', 'full-screen', 'volume-slider', 'stop'
    ]
});
```

## Options

about options:

* *roomId* - any unique text (typeof string)
* *videoContainer* - document.getElemenrtById('yourVideoContainer')
* *isAudio* - true | false
* *isVideo* - true | false