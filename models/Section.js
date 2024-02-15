const mongoose = require('mongoose');
const sectionSchema = new mongoose.Schema({
    username:{
        type: String,
        required:[true, "section id is required"]
    },
    teachers: {
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

const Section = mongoose.model('sections', sectionSchema);


module.exports = Section;