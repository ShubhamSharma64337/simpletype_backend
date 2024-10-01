var express = require('express');
var router = express.Router();
let dotenv = require('dotenv').config()
const { MongoClient } = require("mongodb");
var session = require('express-session')


const client = new MongoClient(process.env.MONGO_CONNECTION);

router.use(session({
  secret: 'Dbcrafter@123',
  resave: false,
  saveUninitialized: true,
  proxy: true, //without this, no cookie is received from the server when hosted on gcloud
  cookie: { 
    //Below, we use the NODE_ENV variable to modify the cookie attributes for making development and production app work properly
    sameSite: process.env.NODE_ENV === 'production'?'none':'lax',
    secure: process.env.NODE_ENV === 'production'?true:false, // This will only work if you have https enabled!
    maxAge: 1800000, // 30 minutes
    httpOnly: false
  } 
}))

/*GET check login status*/
router.get('/loginStatus',function(req,res,next){
  if(req.session.user){
      res.json({success: true, message: "User is logged in", payload: req.session.user.email})
  }else{
    res.json({success: false, message: "User not logged in", payload: null})
  }
})

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
  if(req.session.user){
    res.json({success: false, message: 'Already logged in'});
  }
  else if(!req.body.email || !req.body.password){
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
        req.session.user = {email: req.body.email};
      }
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run()
  .then(()=>{
    if(authenticated){
      res.json({success:true, message: "Successfully logged in", payload: req.session.user.email})
    } else {
      res.json({success:false, message: "Invalid credentials, login failed", payload: null})
    }
  })
  .catch(console.dir);
})
module.exports = router;
