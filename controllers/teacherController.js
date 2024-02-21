const User = require("../models/User")
const Section = require("../models/Sections")
module.exports.listTeachers = async (req, res) => {
    const user  = await User.findById(req.user)
    let teachers = []
    if(user.role ==='admin' || user.role === 'teacher') {
        try {
            teachers = await User.find({role: 'teacher', _id:{ $ne: req.user }})
        }catch (err){
            return res.status(400).json("Some error occurred while fetching the students")
        }

    }
    else if( user.role === 'student') {
        let flag = 0

        if(!user.sections.length)
            return res.status(404).json('Dont worry no students were found :) ')
        if(!user.sections)
            return res.status(404).json('No sections were found')
        const sections = [user.sections]
        await Promise.all(
            sections.map(async (sectionId) => {
                try {
                    const section = await Section.findById(sectionId)
                    if(section) {
                        const teachersSection = section.teacher
                            name = (await User.findById(teachersSection, {}, {}).exec())
                            if(name)
                            teachers.push(name)

                    }
                }catch (err){
                    flag = 1
                    return res.status(400).json({message:err.message})
                }

            })
        )
        if(flag) return
        if(!teachers)
            return res.status(400).json("some error occurred while fetching the students")
    }
    else{
        return res.status(401).json({ message: 'Unauthorized' })
    }

    if (teachers.length) {
        return res.status(200).json(teachers)
    } else {
        return res.status(404).json("No students where found")
    }
}

module.exports.deleteTeacher = async (req, res) =>{
    const userId = String(req.params.id)
    try {
        await User.deleteUserFromSections(userId)
        await User.deleteOne({userId: userId})
        res.status(200).json({userId})
    }catch (err){
        res.status(400).json(err.message)
    }
}

module.exports.editTeacher = async (req, res) => {
    const curUser = await User.findById(req.user).select('userId role')

    const userId = String(req.params.id)
    if(curUser.role!=='admin')
        if(userId !== curUser.userId){
            return res.status(401).json('invalid userId')
        }
    const updateUserData = req.body
    try{
        const updatedUser = await User.findOneAndUpdate({userId:req.params.id}, updateUserData, {new:true})
        if(!updatedUser){
            return res.status(404).json({error:'User not found'})
        }
        return res.status(200).json(updatedUser)
    }catch(err){
        return res.status(500).json({err:'Internal Server Error', message:err.message})
    }

}

