const User = require("../models/User")
const jwt = require ("jsonwebtoken")
const generator = require('generate-password')

const tokenDuration =  5 * 60 * 60 * 1000;
const createToken = (id) => {
  return jwt.sign({ id }, 'EduCareSecret101', {
    expiresIn: tokenDuration
  });
};

module.exports.signup = async (req, res) => {
    console.log("Fefefef");
console.log("Initial " + req.user)
    const user  = await User.findById(req.user)
    if(user.role!=='admin')
        return res.status(401).json("unauthorized access");
    var counter = 0;
    for (let index in req.body) {
      console.log(`Student ${index}:`);
      const student = req.body[index];
      console.log('This is student: ')
      console.log(student)
      
      const { userId, email, password, role, gender, major, address, name, department, aboutme, dob, phonenumber } = student;
      try {
        console.log(++counter);
          const user = await User.create({ userId, email, password, role, gender, major, address, name, department, aboutme, dob, phonenumber });
      }
      catch(err) {
        console.log("whatever: "+name)
        console.log(err.message)
          return res.status(400).json(err.message);
      }
    }
    res.status(201).json({user:user._id});
}
  
module.exports.login= async (req, res) => {
    const {userId, password} = req.body;
    try{
        const user = await User.login(userId,password);
        console.log(user)
        const token = createToken(user._id);
        res.cookie('jwt',token, {/*httpOnly: true,*/ maxAge:tokenDuration, sameSite:"none", secure:true});
        res.cookie('role',user.role,{maxAge:tokenDuration, sameSite:"none",secure:true})
        res.status(200).json({id:user._id, role:user.role, token:token});

    }catch(err){
        console.log(err.message)
        res.status(400).json(err.message);
    }
  }

  module.exports.logout = (req, res) =>{
    res.cookie('jwt', '', {maxAge: 1});
  }

  module.exports.tokenValidate= async (req, res)=>{
      const user = await User.findById(req.user)
      res.status(200).json(user.role)
  }

  const generatePassword = () =>{
      return generator.generate({
          length: 6,
          numbers: true
      })
  }

  module.exports.forgotPassword = async (req, res) =>{

    const email = req.body.email;
    try{
    const user = await User.findOne({email: email})
      if(!user){
          return res.status(404).json('Email is not assigned to any user')
      }
      const newPassword =generatePassword();
      try {
          const updatedUser =await User.updateOne({email: email}, {password: newPassword}, {new: true});
          res.status(200).json(updatedUser.email, updatedUser.userId)
      }catch(err){
          return res.status(500).json(err)
      }
    }catch (err){
          return res.status(404).json('Email is not assigned to any user')
      }
  }

  module.exports.resetPassword =async (req, res) =>{


  }

