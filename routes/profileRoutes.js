const { Router } = require('express');
const profileController = require('../controllers/profileController');
const { verifyTokenAuth } = require('../middleware/auth');
const {profileView} = require("../controllers/profileController");
const router = Router();
router.get('/profile/:id', verifyTokenAuth, profileController.profileView)
router.put('/profile/:id', verifyTokenAuth, profileController.profileEdit)
module.exports = router;