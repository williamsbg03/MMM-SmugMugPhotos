//
// Module : MMM-SmugMugPhotos
//

'use strict'

const smugmugFetcher = require('./smugmug-fetcher.js')

var NodeHelper = require('node_helper')

module.exports = NodeHelper.create({
  start: function () {
    console.log(this.name + ' started')
    this.config = {}
    this.items = []
    this.tempItems = []
    this.started = false
    this.index = 0
  },

  initializeAfterLoading: function (config) {
    this.config = config
    console.log(this.name + ' initialized after loading')

    if (!config.token || !config.tokenSecret) {
      this.sendSocketNotification('AUTHORIZE')
      return
    }

    this.scanPhotos(config)
    this.scanTimer = setInterval(() => this.scanPhotos(config), this.config.scanInterval)
    this.broadcastTimer = setInterval(() => this.broadcast(), this.config.refreshInterval)
  },

  scanPhotos: function (config) {
    this.tempItems = []
    console.log(this.name + ' scanning photos...')
    const self = this
    smugmugFetcher(config).then((items) => {
        self.tempItems = items
        self.finishedScan()
    })
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case 'INIT':
        this.initializeAfterLoading(payload)
        this.sendSocketNotification('INITIALIZED')
        break
    }
  },

  finishedScan: function () {
    switch(this.config.sort) {
      case 'time':
        this.tempItems.sort((a, b) => {
          return b.creationTime - a.creationTime
        })
        break
      case 'reverse':
        this.tempItems.sort((a, b) => {
          return a.creationTime - b.creationTime
        })
        break
      case 'random':
        var currentIndex = this.tempItems.length, temporaryValue, randomIndex
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1
          temporaryValue = this.tempItems[currentIndex]
          this.tempItems[currentIndex] = this.tempItems[randomIndex]
          this.tempItems[randomIndex] = temporaryValue
        }
        break
    }
    console.log(this.name + ' scan finished :', this.tempItems.length)
    this.items = this.tempItems
    this.tempItems= []
    if (this.started == false) {
      this.started = true
      this.broadcast()
    }
  },

  getNextPhoto: function () {
    if (this.items.length <= 0) {
      console.log('There is no scanned photo currently.')
      return
    }
    var photo = null
    if (typeof this.items[this.index] !== 'undefined') {
      photo = this.items[this.index]
    } else {
      photo = this.items[0]
      this.index = 0
    }
    this.index++

    var payload = {
      id: photo.id,
      url: photo.url,
      width: photo.width,
      height: photo.height
    }
    console.log('image', photo.url)
    this.sendSocketNotification('NEW_IMAGE', payload)
  },

  broadcast: function () {
    this.getNextPhoto()
  }
})
