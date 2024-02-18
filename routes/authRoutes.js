const { Router } = require('express')
const authController = require('../controllers/authController')
const { verifyTokenAuth } = require('../middleware/auth')
const router = Router();

router.post('/signup', verifyTokenAuth, authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.get('/validate', verifyTokenAuth, authController.tokenValidate)
// router.post('/forgotPassword', authController.forgotPassword)
// router.post('/resetPassword', verifyTokenAuth, authController.resetPassword)
module.exports = router