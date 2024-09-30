var express = require('express');
const { CommandSucceededEvent } = require('mongodb');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/logout',function(req,res,next){
  if(req.session.user){
    req.session.destroy(()=>{
      res.json({success: true, message: 'Successfully logged out'})
    });
  }else{
    res.json({success: false, message: 'User not logged in'})
  }
})

module.exports = router;
