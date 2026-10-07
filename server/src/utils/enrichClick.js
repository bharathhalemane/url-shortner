const geoip = require('geoip-lite')
const UAParser = require('ua-parser-js');

const BOT_REGEX = /bot|crawler|spider|slurp|preview|facebookexternalhit|embedly|curl|wget|python-requests/i;

const hostnameOf = (ref) => {
    if(!ref) return 'direct';
    try{
        return new URL(ref).hostname || 'direct';
    }catch{
        return 'direct';
    }
}

const enrichClick = (event) => {
    const ip = (event.ip || '').replace(/^::ffff:/, '');
    const geo = ip ? geoip.lookup(ip) : null; 

    const ua = new UAParser(event.ua || '').getResult();
    const device = BOT_REGEX.text(event.ua || '') ? 'bot' : ua.device.type || 'desktop';

    return {
        eventId: event.eventId,
        shortCode: event.shortCode,
        ts: new Date(event.ts),
        country: geo?.country || 'XX', device,
        browser: ua.browser.name || 'unknown',
        os: ua.os.name || 'unknown',
        referrer: hostnameOf(event.ref),
    }
}

module.exports = enrichClick