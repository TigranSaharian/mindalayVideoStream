# What is this?

many to many video streaming

# Instolation

`npm i mindalayvideostream --save`

# Inital function

```
import { __InitConnection, __openOrJoin } from "mindalayvideostream"

__InitConnection({
    roomId: 'roomid_123',
    videoContainer: 'myVideoContainerInBody',
    isAudio: true,
    isVideo: true,
    videoWidth: 1920,
    videoHeight: 1080,
    frameRate: 30,
    videoControls: [
        'mute-audio',
        'mute-video',
        'full-screen',
        'volume-slider',
        'stop'
    ]
});

this function setup videoconnection
```

# Button for join or open the room
```
__openOrJoin('open-or-join-button-id-name');

create any button and take the id
```

## Options

about options:

* *roomId* - any unique text (typeof string)
* *videoContainer* - document.getElemenrtById('yourVideoContainer')
* *isAudio* - true | false
* *isVideo* - true | false