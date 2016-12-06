/**
 * Created by angli on 12/2/16.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var postSchema = new Schema({
    condition: String,
    trades:[String],
    price: Number,
    bookId: String,
    sellerId: String,
    dateCreated: {type: Date, default: Date.now},
    active: {type: Boolean, default: true},
    title: String,
    authors: String,
    isbn: String,
    courses: [String],
    image: String
});

// Export the Mongoose model
module.exports = mongoose.model('Post', postSchema);