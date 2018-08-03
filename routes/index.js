// Index Routes

const express = require('express');
const router = express.Router();

//  Home Page
router.get('/', (req, res)=>{
  res.render('index');
});

//  Login Page
router.get('/login', (req, res)=>{
  res.render('login');
});

//  Registration Page
router.get('/register', (req, res) => {
  res.render('register');
});

// Export
module.exports = router;