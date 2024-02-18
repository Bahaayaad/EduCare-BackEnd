const User = require("../models/User")
const jwt = require ("jsonwebtoken")
const generator = require('generate-password')
const bcrypt = require("bcrypt");

const tokenDuration =  5 * 60 * 60 * 1000;
const createToken = (id) => {
  return jwt.sign({ id }, 'EduCareSecret101', {
    expiresIn: tokenDuration
  });
};

module.exports.signup = async (req, res) => {
    const user  = await User.findById(req.user)
    if(user.role!=='admin')
        return res.status(401).json("unauthorized access");
    for (let index in req.body) {
      const student = req.body[index];

      const { userId, email, password, role, gender, major, address, name, department, aboutme, dob, phonenumber } = student;
      try {
          const user = await User.create({ userId, email, password, role, gender, major, address, name, department, aboutme, dob, phonenumber });
      }
      catch(err) {
          return res.status(400).json(err.message);
      }
    }
    res.status(201).json({user:user._id});
}
  
module.exports.login= async (req, res) => {
    const {userId, password} = req.body;
    try{
        const user = await User.login(userId,password);
        const token = createToken(user._id);
        res.cookie('jwt',token, {/*httpOnly: true,*/ maxAge:tokenDuration, sameSite:"none", secure:true});
        res.cookie('role',user.role,{maxAge:tokenDuration, sameSite:"none",secure:true})
        res.status(200).json({id:user._id, role:user.role, token:token});

    }catch(err){
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
