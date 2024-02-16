const { Router } = require('express');
const authController = require('../controllers/authController');
const { verifyTokenAuth } = require('../middleware/auth');
const router = Router();

router.post('/signup', verifyTokenAuth, authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;