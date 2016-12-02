/**
 * Created by angli on 12/1/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bookSchema = new Schema({
    title: String,
    authors: String,
    isbn: {type: String, unique: true},
    copyrightYear: Number,
    publisher: String,
    edition: Number,
    binding: String,
    image: String,
    courses: [String]
});

module.exports = mongoose.model('Book', bookSchema);