const User = require("../models/User")
const Course = require("../models/Section")
module.exports.listStudents = async (req, res) => {
    const user  = await User.findById(req.user)
    let students = []
    if(user.role ==='admin') {
        try {
            students = await User.find({role: 'student'})
        }catch (err){
            return res.status(400).json("Some error occurred while fetching the students")
        }

    }
    else if(user.role === 'teacher') {
        const sections = [user.sections]
        await Promise.all(
            sections.map(async (sectionId) => {
                try {
                    const section = await Course.findById(sectionId)
                    const studentsSection = section.students
                    for (const studentsId of studentsSection) {
                        name = (await User.findById(studentsId, {}, {}).exec()).toString()
                        students.push(name)
                    }
                }catch (err){
                    return res.status(400).json("some error occurred while fetching the students")
                }

            })
        )
        console.log(sections)
    }
    else{
        return res.status(401).json({ message: 'Unauthorized' })
    }

    if (students.length) {
        console.log(JSON.stringify(students))
        return res.status(200).json(students)
    } else {
        return res.status(404).json("No students where found")
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


