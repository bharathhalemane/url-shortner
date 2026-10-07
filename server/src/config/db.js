const mongoose = require('mongoose');
const { mongoUri } = require('./env');

const connectDB = async () => {    
    try{
        await mongoose.connect(mongoUri);
        console.log("mongodb connected");
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectDB;