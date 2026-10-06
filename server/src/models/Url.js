const mongoose = require('mongoose');
const urlSchema = new mongoose.Schema(
    {
        shortCode: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        longUrl: {
            type: String,
            required: true,            
        },
        isCustom: {
            type: Boolean,
            default: false
        },
        expiresAt: {
            type: Date,
            default: null
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Url', urlSchema);