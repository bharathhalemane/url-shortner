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

urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', urlSchema);