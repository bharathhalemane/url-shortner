const mongoose = require('mongoose');
const { mongoURI } = require('./env');

const connectDB = async () => {
    // console.log(mongoURI)
    try{
        await mongoose.connect(mongoURI);
        console.log("mongodb connected");
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectDB;