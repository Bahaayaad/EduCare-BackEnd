const User = require("../models/User");
const Section = require("../models/Section")
const Courses = require("../models/Courses")

const updateSec = async (studentsIds, teacherId, courseId, section) =>{
    if(studentsIds.length)
    await Promise.all(
        studentIds.map(async (studentId) => {
            const user = await User.findByIdAndUpdate(
                studentId,
                { $push: { sectionss: section._id } },
                { new: true }
            );
        })
    )

    // Update teacher documents with the new section reference
    console.log("ya saterr " + courseId)
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
    const {username,teacher, students, course} = req.body
    let studentIds
    let teacherId
    let courseId
    try {
        studentIds = []
        teacherId = null
        courseId = null
        // gather student ids
        if(students !=null)
        for (const student of students) {
            const studentId = await User.findOne({username: student}).exec()
            studentIds.push(studentId._id)
        }

        // get teacher id
        const tId = await User.findOne({username: teacher}).exec()
        teacherId = tId._id

        // get course id
        const cId = await Courses.findOne({username: course}).exec()
        courseId = cId._id

        // create a new section
        const section = await Section.create({username, students:studentIds, teachers:teacherId, course:courseId})

        // Update user (student, teacher) documents, and update Course document
        await updateSec(studentIds, teacherId, courseId, section)

        console.log(JSON.stringify(section));
        res.status(201).json({})

    } catch (err) {
        console.log(err)
        res.status(404).json({message: err.message})
    }
}
module.exports.createCourses = async(req, res) =>{
    const {username, description} = req.body
    try{
        const course = await Courses.create({username, description})
        console.log(JSON.stringify(course));
        res.status(201).json({})
    }catch (err){
        console.log(err)
        res.status(400).json({message: "error when creating the course"})
    }

}
