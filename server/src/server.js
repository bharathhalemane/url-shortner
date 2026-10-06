const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');
const dns = require("dns")

dns.setServers(["8.8.8.8", "8.8.4.4"]);

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    })
}).catch(err => {
    console.error("Failed to connect to the database", err);
})