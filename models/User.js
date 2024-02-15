const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "is Empty"],
    unique: [true, "the username is taken"],
    lowercase: true,
  },
  name:{
    type:String,
    required:true
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "the length is less than 6 characters"],
  },
  email:{
    type: String,
    required:false,
    lowercase:true,
    validate:[isEmail ,'please enter a valid email']
  },
  role:{
    type:String,
    required: true,
    enum:['admin', 'teacher', 'student']
  },
  gender:{
    type: String, 
    required: [true,"is empty"],
    enum:['male', 'female']
  },

  major:{
    type: String
  },
  address:{
    type: String
  },
  sections: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    }],
    default: []
  }

});
userSchema.post('save', function(doc, next){
    next();
});

userSchema.pre('save',async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

userSchema.statics.login = async function(username, password) { 
    const user = await this.findOne({username});
    if(user){
       const auth = await bcrypt.compare(password, user.password);
       console.log("hohohohohoh")
       if(auth){
        return user;
       }
       throw Error('incorrect password');
    }
    throw Error('invalid username');
}
const User = mongoose.model('user', userSchema);

module.exports = User;