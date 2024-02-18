const mongoose = require('mongoose')
const express = require("express")
const authRoutes = require('./routes/authRoutes')
const studentRoutes = require('./routes/studentRoutes')
const courseRoutes = require('./routes/courseRoutes')
const teacherRouter = require('./routes/teacherRoutes')
const cookieParser = require('cookie-parser')
const { verifyTokenAuth } = require('./middleware/auth')
const User = require('./models/User')
const cors  = require('cors')
const app = express()

// middleware
app.use(cors(
    {
      origin:'http://localhost:3001',
      credentials:true
    }
))
app.use(express.json())
app.use(cookieParser())
app.set('view engine', 'ejs')
// database connection
const dbURI = 'mongodb+srv://baha:1234@cluster0.buphdwp.mongodb.net/EduCare';
mongoose.connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

  // test authentication!
  app.get('/test', verifyTokenAuth, async (req, res) => {
    const user  = await User.findById(req.user,{},{})
    console.log("Let's see the flow: " + JSON.stringify(req.user));
    if(user.role !== 'student'){
      return res.status(403).json({ error: 'Forbidden'})
    }
    res.send('Welcome to the student dashboard!')
   
  })
  app.use(authRoutes)
  app.use(studentRoutes)
  app.use(courseRoutes)
app.use(teacherRouter)
module.exports = app