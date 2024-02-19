const mongoose = require('mongoose')
const courseSchema = new mongoose.Schema({
    courseId:{
       type: String,
        required: true,
        unique:[true, 'The course already has been created']

    },
    name:{
        type:String,
        lowercase:true,
        default:null
    },
    description:{
        type: String,
        lowercase:true,
        required: true
    },
    sections:{
        type:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Section'
        }],
        default:[]
    },
    department:{
        type: String,
        lowercase:true,
       default:null
    },
    hours:{
        type:String,
        lowercase:true,
        default:null
    }
});

courseSchema.post('save', function(doc, next){
    next()
})
const Courses = mongoose.model('courses', courseSchema);

module.exports = Courses;