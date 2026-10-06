const Counter = require('../models/Counter');
const {encode} = require('../utils/base62');

const BLOCK_SIZE =  1000;
const SPACE = 62n ** 7n;
const MULTIPLIER = 2654435761n;

let current = 0;
let end = 0;
let refilling = null;

const allocateBlock = async () => {
    const run = () => {
        Counter.findOneAndUpdate(
            { _id: 'url' },
            { $inc: { seq: BLOCK_SIZE } },
            { returnDocument: "after", upsert: true }
        );
    }

    let doc;
    try{
        doc = await run();
    } catch (err) {
        if (err.code === 11000) doc = await run();
        else throw err;
    }
    current = doc.seq - BLOCK_SIZE;
    end = doc.seq;
}

const nextId = async () => {
    while(current >= end) {
        if (!refilling) {
            refilling = allocateBlock().finally(() => { refilling = null; });
        }
        await refilling;
    }
    return current++;
}

const generateCode = async () => {
    const n = BigInt(await nextId()) + 1n;
    if (n >= SPACE) throw new Error('Short code space exhausted');
    return encode((n * MULTIPLIER) % SPACE)
}

module.exports = { generateCode };