/**
 * Created by angli on 11/16/16.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bookSchema = new Schema({
    title: String,
    authors: String,
    isbn: {type: String, unique: true},
    copyrightYear: Number,
    publisher: String,
    edition: String,
    binding: String,
    image: String,
    courses: [String]
});

// Export the Mongoose model
module.exports = mongoose.model('Book', bookSchema);
