const { Router } = require('express')
const studentController = require('../controllers/studentController')
const { verifyTokenAuth } = require('../middleware/auth')
const courseController = require("../controllers/courseController");
const router = Router()
router.post('/section', courseController.createSection)
router.post('/courses', courseController.createCourses)
router.get('/deleteSectionAndCourse', courseController.soonToDelete)
module.exports = router
