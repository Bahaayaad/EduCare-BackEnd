const { Router } = require('express')
const studentController = require('../controllers/studentController')
const { verifyTokenAuth } = require('../middleware/auth')
const courseController = require("../controllers/courseController");
const router = Router()
router.post('/section', verifyTokenAuth, courseController.createSection)
router.post('/courses', verifyTokenAuth, courseController.createCourses)
router.get('/courses', verifyTokenAuth, courseController.listCourses)
router.get('/section/:id', courseController.listSections)
router.post('/courses/:id', courseController.editCourses)
router.post('sections/:id', courseController.editSection)
router.delete('sections/:id', courseController.deleteSection)
router.get('/deleteSectionAndCourse', courseController.soonToDelete)
module.exports = router
