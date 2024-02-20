const { Router } = require('express')
const teacherController = require('../controllers/teacherController')
const { verifyTokenAuth } = require('../middleware/auth')
const router = Router()
router.get('/teachers', verifyTokenAuth, teacherController.listTeachers)
router.delete('/teachers/:id', verifyTokenAuth, teacherController.deleteTeacher)
router.put('/teachers/:id', verifyTokenAuth, teacherController.editTeacher)
module.exports = router