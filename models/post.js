/**
 * Created by angli on 12/1/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var postSchema = new Schema({
    condition: String,
    trades:[String],
    price: Number,
    bookId: String,
    sellerId: String,
    dateCreated: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Post', postSchema);