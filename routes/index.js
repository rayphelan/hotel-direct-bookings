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

// Export
module.exports = router;