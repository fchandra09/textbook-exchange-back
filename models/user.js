/**
 * Created by angli on 11/16/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: String,
    email: {type: String, unique: true},
    phone: String
});

module.exports = mongoose.model('User', userSchema);
