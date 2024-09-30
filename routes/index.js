var express = require('express');
var router = express.Router();
let dotenv = require('dotenv').config()
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_CONNECTION);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Simpletype API' });
});

/*POST signup middleware*/
router.use('/signup',function(req,res,next){
  if(!req.body.email || !req.body.password){
    res.json({success: false, message: 'Invalid Signup Data'});
  }else{
    next();
  }
})

/*POST signup*/
router.post('/signup', function(req,res,next){
  let existsAlready = false;
  async function run() {
    try {
      const database = client.db('simpletype');
      const users = database.collection('users');
      const existing_user = await users.findOne({email: req.body.email});
      if(!existing_user){
        existsAlready = true;
        const user = await users.insertOne({email: req.body.email, password: req.body.password});
      }
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run()
  .then(()=>{
    if(existsAlready){
      res.json({success:true, message: "Signed up"})
    } else {
      res.json({success:false, message: "User already exists"})
    }
  })
  .catch(console.dir);
})

/*POST login middleware*/
router.post('/login',function(req,res,next){
  if(!req.body.email || !req.body.password){
    res.json({success: false, message: 'Invalid Login Data'});
  }else{
    next();
  }
})

/*POST login*/
router.post('/login',function(req,res,next){
  let authenticated = false;
  async function run() {
    try {
      const database = client.db('simpletype');
      const users = database.collection('users');
      const existing_user = await users.findOne({email: req.body.email, password: req.body.password});
      if(existing_user){
        authenticated = true;
      }
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run()
  .then(()=>{
    if(authenticated){
      res.json({success:true, message: "Signin successful"})
    } else {
      res.json({success:false, message: "Invalid credentials"})
    }
  })
  .catch(console.dir);
})
module.exports = router;
