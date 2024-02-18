const User = require("../models/User")
const Section = require("../models/Sections")
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
    else if(user.role === 'teacher' || user.role === 'student') {
        const sections = [user.sections]
        let flag = 0
        await Promise.all(
            sections.map(async (sectionId) => {
                try {
                    const section = await Section.findById(sectionId)
                    const studentsSection = section.students
                    console.log("we333 " + section)
                    for (const studentsId of studentsSection) {
                        name = (await User.findById(studentsId, {}, {}).exec())
                        students.push(name)
                    }
                }catch (err){
                    flag =1
                }

            })
        )
        if(!students)
            return res.status(400).json("some error occurred while fetching the students")
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
    const userId = String(req.params.id)
    try {
        await User.deleteUserFromSections(userId)
        await User.deleteOne({userId: userId})
        res.status(200).json({userId})
    }catch (err){
        console.log(err.message)
        res.status(400).json(err.message)
    }

}


