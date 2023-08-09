require('dotenv').config()
const express = require("express")
const app = express()
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const path = require('path')
const { default: mongoose, mongo } = require("mongoose")   //const mongoose = require(mongoose)
//const session = require("express-session")
const PORT = process.env.PORT || 3000
const session = require('express-session')
const flash=require('express-flash')
const MongoDbStore =  require('connect-mongo')(session)
//.... Database Connection 
const url = 'mongodb://localhost/pizza'
mongoose.connect(url,
  {
    useNewUrlParser: true,
    //useCreateIndex:true,
    //useFindAndModify: false,
    useUnifiedTopology: true
  }
);
const connection= mongoose.connection;
connection.once('open',()=> {
  console.log('Database connected..');
}).on('error',(err) => {
  console.log('Connection failed..')
  console.log(err);
});


// ....Session store
let mongoStore= new MongoDbStore({
  mongooseConnection: connection,
  collection:'sessions'
})


// .... Session Config
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized:false,
  store:mongoStore,
  cookie:{maxAge: 1000*60*60*24} //24hrs
}))


app.use(flash())

  //.... Assets
app.use(express.static('public'))
app.use(express.json())

//.... global middleware
app.use((req,res,next)=>{
  res.locals.session = req.session
  next()
})



  //.... set Template engine
app.use(expressLayout)
app.set('views',path.join(__dirname, '/resources/views'))
app.set('view engine','ejs')


require('./routes/web.js')(app)

app.listen(PORT , ()=>{
    console.log(`Listening on port ${PORT}`)
})