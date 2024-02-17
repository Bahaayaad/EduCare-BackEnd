const User = require("../models/User")
const Course = require("../models/Section")
module.exports.listStudents = async (req, res) => {
    const user  = await User.findById(req.user)
    let students = []
    if(user.role ==='admin')
        students  = await User.find({role:'student'})
    else if(user.role === 'teacher') {
        const courses = [user.courses]
        await Promise.all(
            courses.map(async (courseId) => {
                const course = await Course.findById(courseId)
                const studentsCourse = course.students
                for (const studentsId of studentsCourse) {
                    name = (await User.findById(studentsId).exec()).userId
                    students.push(name)
                }
            })
        )
        console.log(courses)
    }
    else{
        res.status(401).json({ message: 'Unauthorized' })
    }

    if (students.length) {
        console.log(JSON.stringify(students))
        res.status(200).json(students)
    } else {
        res.status(404).json({ message: 'No students found' })
    }
}
module.exports.deleteStudent = async (req, res) =>{
    console.log("test test")
    const userId = String(req.params.id)
    console.log("wow wow", userId)
    try {
        await User.deleteOne({userId: userId})
        res.status(200).json({userId})
    }catch (err){
        console.log(err.message)
        res.status(400).json(err.message)
    }



}


