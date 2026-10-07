const {Queue} = require('bullmq');
const IORedis = require('ioredis')
const {queueRedisUrl} = require("../config/env")

const QUEUE_NAME = 'clicks'

const connection = new IORedis(queueRedisUrl, {enableOfflineQueue: false})
connection.on('error', () => {});

const clickQueue = new Queue(QUEUE_NAME, {
    connection, 
    defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { age: 3600, count: 10000 },
        removeOnFail: {age: 7 * 24 * 3600}
    }
})
clickQueue.on('error', () => {})

let dropped = 0;

const enqueueClick = (event) => {
    clickQueue.add('click', event, {jobId: event.eventId}).catch(() => {
        dropped++;
        if(dropped % 100 === 1) console.error(`[clicks] dropped events so fat: ${dropped}`)
    })
}

module.exports = {enqueueClick, QUEUE_NAME}