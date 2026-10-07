const mongoose = require('mongoose')

const clickSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true
        },
        shortCode: {
            type: String, required: true
        },
        ts: {
            type: Date,
            required: true
        },
        country: {
            type: String,
            default: 'XX'
        },
        device: {
            type:String,
            default: 'desktop'
        },
        browser: {
            type: String,
            default: 'unknown'
        },
        os:{
            type:String, 
            default: 'unknown'
        },
        referrer: {
            type:String, default:'direct'
        },        
    },
    {versionKey: false}
)

clickSchema.index({shortCode: 1, ts:-1})

module.exports = mongoose.model('Click', clickSchema)