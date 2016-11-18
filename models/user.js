/**
 * Created by angli on 11/16/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: String,
    email: String,
    pendingTasks: [String],
    dateCreated: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', userSchema);
