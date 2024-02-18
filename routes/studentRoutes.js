const { Router } = require('express')
const studentController = require('../controllers/studentController')
const { verifyTokenAuth } = require('../middleware/auth')
const router = Router()
router.get('/students', verifyTokenAuth, studentController.listStudents)
router.put('/students/:id', verifyTokenAuth, studentController.editStudent)
router.delete('/students/:id', verifyTokenAuth, studentController.deleteStudent)
module.exports = router