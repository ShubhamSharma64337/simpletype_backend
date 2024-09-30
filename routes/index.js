var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Simpletype API' });
});

/*POST signup middleware*/
router.use('/signup',function(req,res,next){
  if(!req.body.email || !req.body.password){
    res.json({success: false, message: 'Invalid post data'});
  }else{
    next();
  }
})

/*POST signup*/
router.post('/signup', function(req,res,next){
  
})

module.exports = router;
