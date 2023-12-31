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
const passport = require('passport')
const Emitter = require('events')



//.... Database Connection 
//const url = 
mongoose.connect(process.env.MONGO_CONNECTION_URL,
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


// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)



// .... Session Config
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized:false,
  store:mongoStore,
  cookie:{maxAge: 1000*60*60*24} //24hrs
}))



//Passport Config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())




app.use(flash())

  //.... Assets
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//.... global middleware
app.use((req,res,next)=>{
  res.locals.session = req.session
  res.locals.user = req.user
  next()
  
})



  //.... set Template engine
app.use(expressLayout)
app.set('views',path.join(__dirname, '/resources/views'))
app.set('view engine','ejs')


require('./routes/web.js')(app)
app.use((req,res)=>{
  res.status(404).render('error/404')
})

const server = app.listen(PORT , ()=>{
    console.log(`Listening on port ${PORT}`)
})

//.... socket

const io= require('socket.io')(server)
io.on('connection',(socket)=>{
  //console.log(socket.id)
  socket.on('join',(orderId)=>{
    //console.log(orderId)
    socket.join(orderId)
  })

})

eventEmitter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
  io.to(`adminRoom`).emit('orderPlaced', data)
})

