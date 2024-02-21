const { Router } = require('express')
const studentController = require('../controllers/studentController')
const { verifyTokenAuth } = require('../middleware/auth')
const courseController = require("../controllers/courseController");
const router = Router()
router.post('/section', verifyTokenAuth, courseController.createSection)
router.post('/courses', verifyTokenAuth, courseController.createCourses)
router.get('/courses', verifyTokenAuth, courseController.listCourses)
router.get('/section/:id',verifyTokenAuth, courseController.listSections)
router.post('/courses/:id', verifyTokenAuth, courseController.editCourses)
router.post('sections/:id', verifyTokenAuth, courseController.editSection)
router.delete('sections/:id', verifyTokenAuth, courseController.deleteSection)
router.get('/deleteSectionAndCourse', verifyTokenAuth, courseController.soonToDelete)
module.exports = router
