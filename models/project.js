const { required } = require('joi');
const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    }
    ,
    description:{
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    obejectives: [{
        type: String,
        required: true
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'cancelled'],
        default: 'ongoing'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
})

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;