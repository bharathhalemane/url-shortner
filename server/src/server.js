const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');
const dns = require("dns")
const mongoose = require('mongoose')

dns.setServers(["8.8.8.8", "8.8.4.4"]);

(async () => {
    await connectDB();

    let worker = null;

    if(process.env.RUN_WORKER_IN_API === 'true'){
        const { startWorker } = require('./workers/clickWorker');
        worker = await startWorker({ connect: false});
        console.log('Click worker running in process');
    }

    const server = app.listen(port, () => console.log(`server listening on : ${port}`));

    const shutdown = async () => {
        server.close();
        if(worker) await worker.close();
        await mongoose.disconnect();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

})();