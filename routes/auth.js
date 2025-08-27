const express = require('express');
const router = express.Router();
const {  createAdminUser,
    logInAdmin, 
    verifyEmailAddress, 
    forgotPassword,
    resetPassword,  
    logOut } = require('../controllers/auth');


// router.post('/signup', signup);
router.post('/admin/signup', createAdminUser);
// router.post('/login', login);
router.post('/admin/login', logInAdmin);
router.get('/verify/:email/:verificationToken', verifyEmailAddress);
router.post('/forgot-password', forgotPassword);
router.post('/resetpassword/:email/:resetToken', resetPassword);
router.post('/logout', logOut);

module.exports = router;
 