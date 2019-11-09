const request = require('request-promise')
const querystring = require('querystring')
const prompts = require('prompts')
const baseUrl = 'https://secure.smugmug.com'
const oauthUrl = '/services/oauth/1.0a'

// load module config
const baseConfig = require('../../config/config.js')
const config = baseConfig.modules[0].config

const getRequestToken = async ({ oauth }) => {
    const requestTokenQS = await request({
        url: `${baseUrl}${oauthUrl}/getRequestToken?oauth_callback=oob`,
        oauth,
        json: true
    })
    const requestToken = querystring.parse(requestTokenQS)
    return {
        token: requestToken.oauth_token,
        token_secret: requestToken.oauth_token_secret
    }
}

const getAccessToken = async ({ oauth, verifier }) => {
    const accessTokenQS = await request({
        url: `${baseUrl}${oauthUrl}/getAccessToken?oauth_verifier=${verifier}`,
        oauth,
        json: true
    })
    const accessToken = querystring.parse(accessTokenQS)
    return {
        token: accessToken.oauth_token,
        token_secret: accessToken.oauth_token_secret
    }
}

const authorize = async (config) => {
    let oauth = {
        consumer_key: config.apikey,
        consumer_secret: config.secret
    }
    const requestToken = await getRequestToken({ oauth })
    
    console.log('The below URL will authorize your magic mirror smugmug API key.  Navigate to it, login, and then supply the six digit PIN at the prompt.')
    console.log(`${baseUrl}${oauthUrl}/authorize?Access=Full&Permissions=Read&oauth_token=${requestToken.token}`)
    const response = await prompts({
        type: 'text',
        name: 'pin',
        message: 'Enter your authorization PIN:'
    })
    oauth.token = requestToken.token
    oauth.token_secret = requestToken.token_secret
    const accessToken = await getAccessToken({
        oauth,
        verifier: response.pin
    })
    console.log('Please update your magic mirror smugmug config with the following token and token secret: ')
    console.log(`token: ${accessToken.token}`)
    console.log(`token secret: ${accessToken.token_secret}`)
}

authorize(config)