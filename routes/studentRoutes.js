const { Router } = require('express')
const studentController = require('../controllers/studentController')
const { verifyTokenAuth } = require('../middleware/auth')
const router = Router()
router.get('/students', verifyTokenAuth, studentController.listStudents)
module.exports = router