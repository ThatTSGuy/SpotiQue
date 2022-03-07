function toQueryString(object) {
    return Object.keys(object)
        .map(key => `${key}=${object[key]}`)
        .join('&');
}

function randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for(let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * 26)];

    return result;
}

module.exports = { toQueryString, randomString };