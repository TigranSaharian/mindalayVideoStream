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
    videoControls: ['mute-audio','mute-video']
});

this function setup videoconnection
```

# Button for join or open the room
```
__openOrJoin('open-or-join-button-id');

create any button and take the id
```

## Options

* *roomId* - any unique id (typeof string)
* *videoContainer* - take the HTML element | document.getElementById('elementId')
* *isAudio* - true | false
* *isVideo* - true | false
* *videoControls* - 'mute-audio','mute-video','full-screen',
                    'take-snapshot','record-audio','record-video',
                    'volume-slider','stop'