const fetch = require('node-fetch');
const crypto = require('node:crypto');

const clientID = '6b013b2d7ae74dd59705df7deafb590e';
const clientSecret = 'a7082d1445ea4f40ad0a02591de24628';
const codeVerifier = crypto.randomBytes(32).toString('hex');

function getAuthURL() {
    const state = crypto.randomUUID();
    const scope = 'user-read-private';

    return 'https://accounts.spotify.com/authorize?' +
        toQueryString({
            response_type: 'code',
            client_id: clientID,
            scope: scope,
            redirect_uri: redirectURI,
            state: state,
            // PKCE extension
            code_challenge_method: 'S256',
            code_challenge: crypto.createHash('sha256').update(codeVerifier).digest('base64url'),
        })
}

async function getAuthToken(code) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: toQueryString({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectURI,
            // PKCE extension
            client_id: clientID,
            code_verifier: codeVerifier,
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${clientID}:${clientSecret}`).toString('base64'),
        },
    })

    return await response.json();
}

function toQueryString(object) {
    return Object.keys(object)
        .map(key => `${key}=${object[key]}`)
        .join('&');
}

module.exports = { getAuthURL, getAuthToken };