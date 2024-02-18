const User = require("../models/User");
const Section = require("../models/Sections")
const Courses = require("../models/Courses")

const updateSec = async (studentsIds, teacherId, courseId, section) =>{
    if(studentsIds.length)
    await Promise.all(
        studentsIds.map(async (studentId) => {
            console.log("almost there " + studentId)
            const user = await User.findByIdAndUpdate(
                studentId,
                { $push: { sections: section._id } },
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
            try {
                const studentId = await User.findOne({userId: student, role: "student"}).exec()
                console.log("??? " + studentId)
                studentIds.push(studentId._id)
            }catch (err){
                return res.status(400).json("The student " + student + ' does not exist')
            }
        }
        console.log("test test "+studentIds)

        // get teacher id
        console.log("ma 7beet " + teacher)
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
                const cId = await Courses.findOne({username: course}).exec()
                console.log("most7eeel " + cId)
                courseId = cId._id
            }catch (err){
                console.log("lets see " +err.message)
                return res.status(400).json("Error occurred while fetching the course")
            }
        }else {
            return res.status(400).json('Course was not found')
        }


        // create a new section
        const section = await Section.create({username, students:studentIds, teacher:teacherId, course:courseId})
        // Update user (student, teacher) documents, and update Course document
        await updateSec(studentIds, teacherId, courseId, section)

        console.log(JSON.stringify(section));
        res.status(201).json({section})

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
        res.status(201).json(course)
    }catch (err){
        console.log(err)
        res.status(400).json({message: "error when creating the course"})
    }
}
module.exports.soonToDelete = async (req, res) =>{
    const first = await Section.deleteMany({})
    const second = await Courses.deleteMany({})
    res.status(200).json("cool")
}
