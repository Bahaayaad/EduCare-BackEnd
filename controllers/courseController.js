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
    const curUser = await User.findById(req.user)
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
    const curUser = await User.findById(req.user)
    let courses = []
    if(curUser.role === 'admin'){
        try {
            courses = await Courses.find({})
            if(!courses){
                return res.status(400).json('not found')
            }
        }catch (err){
            console.log("Course Admin fetching error")
            return res.status(400).json(err.message)
        }
    }

    else if(curUser.role === 'teacher' || curUser.role === 'student') {
        let flag = 0
        if(![curUser.sections])
            return res.status(400).json('not found')
        const sections = [curUser.sections]
        await Promise.all(
            sections.map(async (sectionId) => {
                try {
                    const section = await Section.findById(sectionId)
                    if(!section) {
                        flag = 1
                        return res.status(400).json('no sections were found')
                    }
                    const course = await Courses.findById(section.course)
                    if(!course) {
                        flag = 1
                        return res.status(400).json('The course were not found')
                    }
                    courses.push(course)
                }catch (err) {
                    flag = 1
                    console.log(err.message)
                    return res.status(404).json(err.message)
                }

            })
        )
        if(flag) return
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

module.exports.editCourses = async (req, res) => {
    const curUser = await User.findById(req.user).select('userId role')

    const courseId = String(req.params.id)
    if(curUser.role!=='admin')
        if(courseId !== curUser.userId){
            return res.status(401).json('invalid userId')
        }
    const updateCourseData = req.body
    try{
        const updateCourse = await Courses.findOneAndUpdate({courseId:req.params.id}, updateCourseData, {new:true})
        if(!updateCourse){
            return res.status(404).json({error:'User not found'})
        }
        return res.status(200).json(updateCourse)
    }catch(err){
        return res.status(500).json({err:'Internal Server Error', message:err.message})
    }


}
module.exports.editSection = async (req, res) =>{
    const curUser = await User.findById(req.user).select('userId role')

    const sectionId = String(req.params.id)
    if(curUser.role!=='admin')
        if(sectionId !== curUser.userId){
            return res.status(401).json('invalid userId')
        }
    const updateSectionData = req.body
    try{
        const updateSection = await Section.findOneAndUpdate({sectionId:req.params.id}, updateSectionData, {new:true})
        if(!updateSection){
            return res.status(404).json({error:'User not found'})
        }
        return res.status(200).json(updateSection)
    }catch(err){
        return res.status(500).json({err:'Internal Server Error', message:err.message})
    }
}

module.exports.deleteCourse = async (req, res) =>{
    const curUser = await User.findById(req.user).select('userId role')

    const courseId = String(req.params.id)
    if(curUser.role!=='admin')
        if(courseId !== curUser.userId){
            return res.status(401).json('invalid userId')
        }
    try {
        const course = await Courses.findOne({courseId: courseId})
        if(!course){
            return res.status(400).json('Section not found')
        }
        //delete course from sections
        const courseSections = course.sections
        if(courseSections){
            if(courseSections.length > 0){
                await Promise.all(
                    courseSections.map(async (sectionId) => {
                        const section = await Section.findOne({sectionId: sectionId})
                        if(!section){
                            return res.status(400).json('Section not found')
                        }
                        //delete section from students
                        const sectionStd = section.students
                        if(sectionStd){
                            if(sectionStd.length > 0){
                                await Promise.all(
                                    sectionStd.map(async (studentId) => {
                                        await User.findByIdAndUpdate(
                                            studentId,
                                            { $pull: { sections: section._id } },
                                            { new: true }
                                        );
                                    })
                                )
                            }
                        }

                        //delete section from teacher
                        const sectionTch = section.teacher
                        if(sectionTch)
                            await User.findByIdAndUpdate(
                                sectionTch,
                                { $pull: { sections: section._id } },
                                { new: true })
                        await Section.findByIdAndDelete(sectionId);
                    })
                )
            }
        }
        // delete course
        const courseDelete = await Courses.deleteOne({courseId: courseId})
        return res.status(200).json(courseDelete)
    }catch (err){
           return res.status(500).json('an error occurred: ' + err.message)
    }
}

module.exports.deleteSection = async (req, res) =>{
    const curUser = await User.findById(req.user).select('userId role')

    const sectionId = String(req.params.id)
    if(curUser.role!=='admin')
        if(courseId !== curUser.userId){
            return res.status(401).json('invalid userId')
        }
    try {
        const section = await Section.findOne({sectionId: sectionId})
        if(!section){
            return res.status(400).json('Section not found')
        }
        //delete section from students
        const sectionStd = section.students
        if(sectionStd){
            if(sectionStd.length > 0){
                await Promise.all(
                    sectionStd.map(async (studentId) => {
                        await User.findByIdAndUpdate(
                            studentId,
                            { $pull: { sections: section._id } },
                            { new: true }
                        );
                    })
                )
            }
        }

        //delete section from teacher
        const sectionTch = section.teacher
        if(sectionTch)
            await User.findByIdAndUpdate(
                sectionTch,
                { $pull: { sections: section._id } },
                { new: true })

        // delete section from course
        const courseId = section.course
        await Courses.findByIdAndUpdate(
            courseId,
            {$pull:{sections:section._id}},
            {new: true})

        // delete section
        const sectionDelete = await Section.deleteOne({sectionId: sectionId})
        return res.status(200).json(sectionDelete)
    }catch (err){
        return res.status(500).json('an error occurred: ' + err.message)
    }
}
