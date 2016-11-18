/**
 * Created by angli on 11/16/16.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var taskSchema = new Schema({
    name: String,
    description: String,
    deadline: Date,
    completed: {type: Boolean, default: false},
    assignedUser: String,
    assignedUserName: {type: String, default: "unassigned"},
    dateCreated: {type: Date, default:Date.now}
});

// Export the Mongoose model
module.exports = mongoose.model('Task', taskSchema);