const { Router } = require('express')
const studentController = require('../controllers/studentController')
const { verifyTokenAuth } = require('../middleware/auth')
const router = Router()
router.get('/teachers', verifyTokenAuth, studentController.listStudents)
router.delete('/teachers/:id', verifyTokenAuth, studentController.deleteStudent)
module.exports = router