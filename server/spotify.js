const SpotifyAPI = require('spotify-web-api-node');
const fetch = require('node-fetch');
const util = require('./util');

const api = newAPI();

class Room {
    constructor(accessToken, io) {
        this.io = io;
        this.id = util.randomString(5);

        this.api = newAPI(accessToken);

        this.state = { isPlaying: false };
        this.beginSync();
    }

    beginSync() {
        setInterval(async () => {
            const res = await this.api.getMyCurrentPlaybackState();

            if (res.body && Object.keys(res.body).length !== 0) {
                this.state = {
                    name: res.body.item.name,
                    artists: res.body.item.artists.map(a => a.name).join(', '),
                    image: res.body.item.album.images[0].url,
                    progress: res.body.progress_ms,
                    duration: res.body.item.duration_ms,
                    volume: res.body.device.volume_percent,
                    isPlaying: res.body.is_playing,
                }
            } else {
                this.state = { isPlaying: false };
            }

            this.emit('state', this.state);
        }, 5000);
    }

    setVolume(volume) {
      this.api.setVolume(volume);
    }

    playNext(uri) {
      fetch('https://api.spotify.com/v1/me/player/queue', {
        method: 'POST',
        body: util.toQueryString({ uri }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.api.getAccessToken(),
        },
      }).then(res => console.log(res));
    }

    emit(event, data) {
        this.io.to(this.id).emit(event, data);
    }
}

function newAPI(accessToken) {
    return new SpotifyAPI({
        clientId: '6b013b2d7ae74dd59705df7deafb590e',
        clientSecret: '319c0624bff34fa79c0dd007aa907e29',
        redirectUri: 'https://SpotiQue.jacktemko1.repl.co/auth/callback',
        accessToken,
    })
}

module.exports = { api, Room };