const mongoose = require('mongoose');

const taskResultsSchema = new mongoose.Schema({
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    runtime: {
        type: Number,
    },
    filesAdded: [String],
    filesDeleted: [String],
    defaultfiles: [String],
    magicString: {
        type: Number,
    },
    status: {
        type: String,
    }
});

const TaskModel = mongoose.model('TaskResults', taskResultsSchema);

module.exports = TaskModel;
