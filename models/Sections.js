const mongoose = require('mongoose');
const sectionSchema = new mongoose.Schema({
    sectionId:{
        type: String,
        required:[true, "section id is required"]
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    students: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, "course is required"],
        ref:'Course'
    }
});

const Section = mongoose.model('Sections', sectionSchema);


module.exports = Section;