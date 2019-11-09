//
// MMM-SmugMugPhotos
//
Module.register('MMM-SmugMugPhotos', {
    defaults: {
      refreshInterval: 1000*15, // time each photo is displayed in milliseconds (default 15 seconds)
      scanInterval: 1000*60*1440, // time between photo catalog refreshes (default 24 hours)
      sort: 'random', //'time', 'reverse', 'random'
      opacity: 1, // resulting image opacity. Consider reducing this value if you are using this module as a background picture frame
      mode: 'hybrid', // 'cover', 'contain', or 'hybrid'  :: hybrid will switch between cover and contain based on image orientation and screen orientation
      transitionImages: true,
      transitionSpeed: '1s'
    },
  
    getStyles: function () {
      return ['MMM-SmugMugPhotos.css']
    },
  
    start: function() {
      this.sendSocketNotification('INIT', this.config)
    },
  
    getDom: function() {
      var wrapper = document.createElement('div')
      wrapper.id = "smugmug-wrapper"
      this.div1 = this.createDiv('photo1');
      this.div2 = this.createDiv('photo2');
      wrapper.appendChild(this.div1);
      wrapper.appendChild(this.div2);
      return wrapper
    },

    createDiv: function(name) {
      var div = document.createElement('div');
      div.id = name + this.identifier;
      div.style.transition = 'opacity ' + this.config.transitionSpeed + ' ease-in-out';
      div.className = 'smugmug-photo';
      return div;
    },
  
    showImage: function(payload) {
      console.log(`Showing image: ${JSON.stringify(payload)}`)
      if (this.config.transitionImages) {
        this.swapDivs();
      }
      var div1 = this.div1;
      var div2 = this.div2;
      div1.style.backgroundImage = 'url(' + payload.url + ')'
      div1.style.opacity = this.config.opacity;
      if (this.config.mode == 'hybrid') {
        var rect = div1.getBoundingClientRect()
        var rr = ((rect.width / rect.height) > 1) ? 'h' : 'v'
        var ir = ((payload.width / payload.height) > 1) ? 'h' : 'v'
        div1.style.backgroundSize = (rr == ir) ? 'cover' : 'contain'
      } else {
        div1.style.backgroundSize = this.config.mode
      }
      div2.style.opacity = 0;
    },

    swapDivs: function() {
      var temp = this.div1;
      this.div1 = this.div2;
      this.div2 = temp;
    },

    showAuthorizationRequired: function() {
      document.getElementById('smugmug-wrapper').innerHTML = 'No SmugMug token and token secret found in magic mirror config, run smugmug-auth utility first!'
    },
  
    socketNotificationReceived: function(notification, payload) {
      switch(notification) {
        case 'NEW_IMAGE':
          this.showImage(payload)
          break
        case 'AUTHORIZE':
          this.showAuthorizationRequired()
      }
    },
  
    notificationReceived: function(notification, payload, sender) {}
  })
  