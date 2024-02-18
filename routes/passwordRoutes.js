const { Router } = require('express')
const passwordController = require('../controllers/passwordController')
const { verifyTokenAuth } = require('../middleware/auth')
const router = Router();
router.post('/forgotPassword', passwordController.forgotPassword)
router.post('/resetPassword', verifyTokenAuth, passwordController.resetPassword)
module.exports = router
