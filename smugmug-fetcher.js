const request = require('request-promise')
const baseUrl = 'https://api.smugmug.com'
const nodeFilters = 'start=1&_filter=Name,Type,HasChildren,Uri&_filteruri=Album&_shorturis'
const nodeMaxCount = 999
const imageMaxCount = 999

const findNode = async ({ nodeUri, nodeNames, oauth }) => {
    const children = await request({
        url: `${baseUrl}${nodeUri}!children?count=${nodeMaxCount}&${nodeFilters}`,
        oauth,
        json: true
    })
    const matches = children.Response.Node.reduce(async (acc, data) => {
        const accumulator = await acc
        if (nodeNames.includes(data.Name)) {
            return accumulator.concat([data])
        } else if (data.HasChildren) {
            const childMatches = await findNode({
                nodeUri: data.Uri,
                nodeNames,
                oauth
            })
            return accumulator.concat(childMatches)
        } else {
            return accumulator
        }
    }, Promise.resolve([]))
    return matches
}

const findAlbumImages = async ({ nodeUri, nodeNamesBlacklist, oauth, imageSize }) => {
    const children = await request({
        url: `${baseUrl}${nodeUri}!children?count=${nodeMaxCount}&${nodeFilters}`,
        oauth,
        json: true
    })
    const images = children.Response.Node.reduce(async (acc, data) => {
        const accumulator = await acc
        if (nodeNamesBlacklist.includes(data.Name)) {
            console.log(`Excluding node: ${data.Name}`)
            return Promise.resolve(accumulator)
        } else if (data.Type === 'Album') {
            console.log(`Getting images for album: ${data.Name}`)
            const images = await getImages({
                albumUri: data.Uris.Album,
                oauth,
                imageSize
            })
            return Promise.resolve(accumulator.concat(images))
        } else {
            const images = await findAlbumImages({
                nodeUri: data.Uri,
                nodeNamesBlacklist,
                oauth,
                imageSize
            })
            return Promise.resolve(accumulator.concat(images))
        }
    }, Promise.resolve([]))
    return images
}

const getImages = async ({ albumUri, oauth, imageSize }) => {
    const albumImages = await request({
        url: `${baseUrl}${albumUri}!images?count=${imageMaxCount}&start=1&_filter=ArchivedUri,IsVideo,Date,ImageKey,OriginalHeight,OriginalWidth&_filteruri`,
        oauth,
        json: true
    })
    const images = albumImages.Response.AlbumImage.reduce((acc, data) => {
        if (data.IsVideo) {
            return acc
        } else {
            const fileExtensionSeparator = data.ArchivedUri.lastIndexOf('.')
            const fileSizeSeparator = data.ArchivedUri.lastIndexOf('-')
            const lastPathSeparator = data.ArchivedUri.lastIndexOf('/')
            const secondLastPathSeparator = data.ArchivedUri.lastIndexOf('/', lastPathSeparator - 1)
            const sizedPath = data.ArchivedUri.substring(0, secondLastPathSeparator + 1) + 
                imageSize + 
                data.ArchivedUri.substring(lastPathSeparator, fileSizeSeparator + 1) +
                imageSize +
                data.ArchivedUri.substring(fileExtensionSeparator)
            return acc.concat({
                id: data.ImageKey,
                creationTime: Date.parse(data.Date),
                url: sizedPath,
                width: data.OriginalWidth,
                height: data.OriginalHeight
            })
        }
    }, [])
    return images
}


const fetcher = async (config) => {
    console.log('Fetching smugmug images: ', new Date())
    const oauth = {
        consumer_key: config.apikey,
        consumer_secret: config.secret,
        token: config.token,
        token_secret: config.tokenSecret,
    }
    const user = await request({
        url: `${baseUrl}/api/v2/user/${config.user}?_filter&_filteruri=Node&_shorturis=true`,
        oauth,
        json: true
    })

    const matchedNodes = await findNode({
        nodeUri: user.Response.User.Uris.Node,
        nodeNames: config.nodeNames,
        oauth
    })

    const images = matchedNodes.reduce(async (acc, data) => {
        const accumulator = await acc
        let images;
        if (data.Type === 'Album') {
            console.log(`Getting images for album: ${data.Name}`)
            images = await getImages({
                albumUri: data.Uris.Album,
                oauth,
                imageSize: config.imageSize
            })
        } else {
            images = await findAlbumImages({
                nodeUri: data.Uri,
                nodeNamesBlacklist: config.nodeNamesBlacklist,
                oauth,
                imageSize: config.imageSize
            })
        }
        return Promise.resolve(accumulator.concat(images))
    }, Promise.resolve([]))

    return images
}

module.exports = fetcher
