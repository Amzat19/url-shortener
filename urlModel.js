const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UrlSchema = new Schema({
    original_url: {
        type: String,
        required: true
    },
    short_url: {
        type: Number,
        required: true
    }
});

const urlModel = mongoose.model('UrlModel', UrlSchema);
module.exports = urlModel;