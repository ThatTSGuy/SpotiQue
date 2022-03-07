const room = location.pathname.substring(1);

const $ = qs => document.querySelector(qs);

const socket = io({
    query: { room },
})

socket.on('redirect', url => {
    location = url;
})

let localState = {
    name: 'Loading...',
    artists: '',
    image: '',
    progress: 0,
    duration: 0,
    volume: 0,
    isPlaying: false,
}

socket.on('state', state => {
    if (state.isPlaying) {
        localState = state;
    }
})

setInterval(() => {
    localState.progress += 1000;
    updateView();
}, 1000);

function updateView() {
    $('.track-image').src = localState.image;
    $('.track-name').innerText = localState.name;
    $('.track-artist').innerText = localState.artists;

    $('.progress-progress').innerText = formatMS(localState.progress);
    $('.progress-duration').innerText = formatMS(localState.duration);
    const px = Math.round(localState.progress / localState.duration * $('.progress-container').clientWidth);
    $('.progress-track').style.width = px + 'px';
    $('.progress-thumb').style.transform = `translate(${px}px, -5px)`;
}

updateView();

function formatMS(ms) {
    const date = new Date(ms);
    const s = date.getSeconds();
    return `${date.getMinutes()}:${(s < 10 ? '0' : '') + s}`;
}