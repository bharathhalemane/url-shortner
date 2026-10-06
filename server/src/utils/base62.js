const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = 62n;

const encode = (n, width = 7) => {
    let out = '';
    while (n > 0n) {
        out = ALPHABET[Number(n % BASE)] + out;
        n /= BASE;
    }

    return out.padStart(width, ALPHABET[0]);
}

const decode = (str) => {
    let n = 0n;
    for(const ch of str){
        const i = ALPHABET.indexOf(ch);
        if (i===-1) throw new Error('Invalid base62 character');
        n = n * BASE + BigInt(i);
    }
    return n;
}

module.exports = { encode, decode };