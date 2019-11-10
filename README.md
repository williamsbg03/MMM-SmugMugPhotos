# MMM-SmugMugPhotos
Display your photos from SmugMug on MagicMirror

### Screenshot
![Example Module Screenshot](https://github.com/williamsbg03/MMM-SmugMugPhotos/blob/master/example.jpg?raw=true)

### Acknowledgements
Much of the presentation logic for this module was directly referenced from the following modules:
https://github.com/eouia/MMM-GooglePhotos  
https://github.com/darickc/MMM-BackgroundSlideshow  

### Installation

1. Install Module
   ```sh
   git clone https://github.com/williamsbg03/MMM-SmugMugPhotos.git
   cd MMM-SmugMugPhotos
   npm install
   ```

2. Create your magic mirror SmugMug API Key
   
   https://api.smugmug.com/api/developer/apply

   Copy the generated key and secret into your module config

3. Create SmugMug OAuth Token
   ```
   cd MMM-SmugMugPhotos
   node smugmug-auth.js
   ```
   Copy the output token and token secret into your module config

### Configuration
```javascript
{
    module: 'MMM-SmugMugPhotos',
    position: 'fullscreen_below',
    config: {
        refreshInterval: 1000*15, // time each photo is displayed in milliseconds (default 15 seconds)
        scanInterval: 1000*60*1440, // time between photo catalog refreshes (default 24 hours)
        sort: 'random', //'time', 'reverse', 'random'
        opacity: 1, // image opacity
        mode: 'hybrid', // 'cover', 'contain', or 'hybrid' :: hybrid will switch between cover and contain based on image orientation and screen orientation
        transitionImages: true,
        transitionSpeed: '1s',
        user: 'SMUGMUG USER',
        apikey: 'SMUGMUG API KEY',
        secret: 'SMUGMUG API KEY SECRET',
        token: 'SMUGMUG OAUTH TOKEN',
        tokenSecret: 'SMUGMUG OAUTH TOKEN SECRET',
        nodeNames: ['Top Level Album 1', 'Top Level Album 2'],
        nodeNamesBlacklist: ['Excluded Sub Album 1', 'Excluded Sub Album 2'],
        imageSize: 'X4'
    }
}
```

### Last Tested;
- MagicMirror : v2.9.0
- node.js : 10.x
