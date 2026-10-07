const { Worker } = require('bullmq')
const IORedis = require('ioredis')
const mongoose = require('mongoose')

const { queueRedisUrl, clickBatchSize, clickFlushMs } = require('../config/env')
const connectDB = require('../config/db')
const Click = require('../models/Click')
const { QUEUE_NAME} = require("../queues/clickQueue")
const enrichClick = require("../utils/enrichClick")
const Batcher = require("./batcher")

const dns = require("dns")

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const insertClicks = async (docs) => {
    try {
        await Click.insertMany(docs, {ordered: false})
    }catch(err){
        const onlyDuplicates = Array.isArray(err.writeErrors) && err.writeErrors.every((e) => (e.code ?? e.err?.code) === 11000)
        if (!onlyDuplicates) throw err;
    }
}

(async () => {
    await connectDB();
    const batcher = new Batcher(insertClicks, clickBatchSize, clickFlushMs)

    const worker = new Worker(
        QUEUE_NAME,
        async (job) => {
            await batcher.add(enrichClick(job.data));
        },
        {
            connection: new IORedis(queueRedisUrl, { maxRetriesPerRequest: null }),
            concurrency: clickBatchSize,
        }
    )

    worker.on('failed', (job, err) => console.error(`[worker] job ${job?.id} failed:`, err.message));
    worker.on('error', (err) => console.error('[worker] error:', err.message));
    console.log('Click worker running')

    const shutdown = async () => {
        await worker.close();
        await mongoose.disconnect();
        process.exit(0);
    }
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown)
})();
