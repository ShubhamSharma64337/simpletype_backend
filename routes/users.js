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
  cookie: { secure: false }
}))

/*Middleware to check authentication*/
router.use('/', function(req,res,next){
  if(req.session.user){
    next();
  }else{
    res.json({success: false, message: 'You must be authenticated to access this route!'})
  }
})


router.get('/logout',function(req,res,next){
  if(req.session.user){
    req.session.destroy(()=>{
      res.json({success: true, message: 'Successfully logged out'})
    });
  }else{
    res.json({success: false, message: 'User not logged in'})
  }
})

router.post('/addresult', function(req,res,next){
  async function run() {
    try {
      const database = client.db('simpletype');
      const users = database.collection('results');
      await users.insertOne({email: req.session.user.email, gross: req.body.gross, net: req.body.net, timeTaken: req.body.timeTaken, title: req.body.title, dtime: new Date().toLocaleString()});
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run()
  .then(()=>{
      res.json({success:true, message: "Result Saved"})
  })
  .catch(console.dir);
})

router.get('/getresults',function(req,res,next){
  var sendRes = new Array();
  async function run() {
    try {
      const database = client.db('simpletype');
      const users = database.collection('results');
      const results = await users.find({email: req.session.user.email},{projection: {_id: 0, email: 0}}).toArray();
      sendRes = [...results];
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run()
  .then(()=>{
      res.json({success:true, message: sendRes})
  })
  .catch(console.dir);
})
module.exports = router;
