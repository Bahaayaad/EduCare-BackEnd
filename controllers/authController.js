const User = require("../models/User")
const jwt = require ("jsonwebtoken")

const tokenDuration =  5 * 60 * 60 * 1000;
const createToken = (id) => {
  return jwt.sign({ id }, 'EduCareSecret101', {
    expiresIn: tokenDuration
  });
};
module.exports.signup = async (req, res) => {
    const { username, email, password, role, gender, major, address, name } = req.body;

    try {
        const user = await User.create({ username, email, password, role, gender, major, address, name });
        const token  = createToken(user._id);
        res.cookie('jwt',token, { maxAge:tokenDuration});
        console.log("here's what I have created: " + token);
        res.status(201).json({user:user._id});
    }
    catch(err) {
        res.status(400).json(err.message);
    }
  }
  
module.exports.login= async (req, res) => {
    const {username, password} = req.body;
    try{
        const user = await User.login(username,password);
        console.log(user)
        const token = createToken(user._id);
        res.cookie('jwt',token, {/*httpOnly: true,*/ maxAge:tokenDuration, sameSite:"none", secure:true});
        res.status(200).json({id:user._id, role:user.role});

    }catch(err){
        res.status(400).json({});
    }
  }

  module.exports.logout = (req, res) =>{
    res.cookie('jwt', '', {maxAge: 1}); 
  }