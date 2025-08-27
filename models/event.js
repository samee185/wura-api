const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true, 
    },
    eventTime: {
        type: String,   
        required: true,
    },
    venue:{
        type: String,
        required: true,
    },
    images: [{
        type: String,
        required: true,
    }],
    aboutEvent: {
        type: String,   
        required: true,
    },
    objectives: [{
        type: String,
        required: true,
    }],
    speakers: [{
        name: { type: String, required: true }, 
        bio: { type: String, required: true },
        photo: { type: String, required: true }
    }],
    host: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }, 
})

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;