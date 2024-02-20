const User = require("../models/User");
const Section = require("../models/Sections")
const Courses = require("../models/Courses")
const {etag} = require("express/lib/utils");

const updateSec = async (studentsIds, teacherId, courseId, section) =>{
    if(studentsIds.length)
    await Promise.all(
        studentsIds.map(async (studentId) => {
            await User.findByIdAndUpdate(
                studentId,
                { $push: { sections: section._id } },
                { new: true }
            );
        })
    )

    // Update teacher documents with the new section reference
    await User.findByIdAndUpdate(
        teacherId,
        { $push: { sections: section._id } },
        { new: true })
    // Update course by adding a new section to it
    await Courses.findByIdAndUpdate(
        courseId,
        {$push:{sections:section._id}},
        {new: true})
}


module.exports.createSection = async (req, res) => {
    const curUser = await User.findById(req.user).select('role')
    if(curUser.role!=='admin'){
        return res.status(401).json('Not authorized')
    }
    const {teacher, students, course, room, time, days} = req.body
    let studentIds
    let teacherId
    let courseId
    let sectionId
    try {
        studentIds = []
        teacherId = null
        courseId = null
        // gather student ids
        if(students !=null)
        for (const student of students) {
            try {
                const studentId = await User.findOne({userId: student, role: "student"}).exec()
                studentIds.push(studentId._id)
            }catch (err){
                return res.status(400).json("The student " + student + ' does not exist')
            }
        }

        // get teacher id
        if(teacher) {
            try {
                const tId = await User.findOne({userId: teacher, role: 'teacher'}).exec()
                teacherId = tId._id
            }catch (err){
                return res.status(400).json("Error occurred while fetching the teacher")
            }

        }else {
            return res.status(400).json('Teacher was not found')
        }

        // get course id
        if(course) {
            try {
                const cId = await Courses.findOne({courseId: course}).exec()
                courseId = cId._id
                sectionId = `${cId.courseId}-${cId.sections.length+1}`
            }catch (err){
                return res.status(400).json("Error occurred while fetching the course")
            }
        }else {
            return res.status(400).json('Course was not found')
        }


        // create a new section
        const section = await Section.create({sectionId:sectionId, students:studentIds, teacher:teacherId, course:courseId, room:room, time:time, days:days})
        // Update user (student, teacher) documents, and update Course document
        await updateSec(studentIds, teacherId, courseId, section)

        res.status(201).json({section})

    } catch (err) {
        res.status(404).json({message: err.message})
    }
}
module.exports.createCourses = async(req, res) =>{
    const curUser = await User.findById(req.user).select('role')
    if(curUser.role!=='admin'){
        return res.status(401).json('Not authorized')
    }
    const {courseId, description, name, sections, department, hours} = req.body
    try{
        const course = await Courses.create({courseId, description, name, sections, department, hours })
        res.status(201).json(course)
    }catch (err){
        res.status(400).json({message: err.message})
    }
}
module.exports.soonToDelete = async (req, res) =>{
    await Section.deleteMany({})
    await Courses.deleteMany({})
    res.status(200).json("cool")
}

module.exports.listCourses = async (req, res) => {
    const curUser = await User.findById(req.user).select('role')
    let courses = new Set()
    if(curUser.role === 'admin'){
        try {
            courses = await Courses.find({})
        }catch (err){
            console.log("Course Admin fetching error")
            return res.status(400).json(err.message)
        }
    }

    else if(curUser.role === 'teacher' || curUser.role === 'student') {
        const sections = [curUser.sections]
        await Promise.all(
            sections.map(async (sectionId) => {
                try {
                    const section = await Section.findById(sectionId)
                    const course = await Courses.findById(section.course)
                    courses.add(course)
                }catch (err) {
                    console.log(err.message)
                    return res.status(404).json(err.message)
                }

            })
        )
    }
    else{
        return res.status(401).json({ message: 'Unauthorized' })
    }

    if (courses.length) {
        return res.status(200).json(courses)
    } else {
        return res.status(404).json("No courses where found")
    }
}

module.exports.listSections = async (req, res) =>{
    const courseId = req.params.id
    let sections = []
    let teachers = []
    try {
        const course = await Courses.findOne({courseId: courseId})
        if(!course){
            return res.status(404).json({message: 'course not found'})
        }
        if(course.sections.length)
        for (section of course.sections){
            const s = await Section.findById(section._id)
            const t = await User.findById(s.teacher).select('name userId')
            teachers.push(t)
            sections.push({section:s,teacher:t})
        }

        if (sections.length) {
            return res.status(200).json({sections:sections})
        } else {
            return res.status(404).json("No courses where found")
        }

    }catch (err){
        return res.status(400).json(err.message)
    }

}

// TO-DO
module.exports.editCourses = async (req, res) => {



}
// TO-DO
module.exports.editSection = async (req, res) =>{



}
