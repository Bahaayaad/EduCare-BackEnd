const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');
const generator = require('generate-password')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const Section = require("../models/Sections")


const userSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: [true, "is Empty"],
      unique: [true, "the userId is not unique"],
      lowercase: true
  },
    name:{
      type:String,
      required:true,
      lowercase:true
  },
    password: {
      type: String,
      minlength: [6, "the length is less than 6 characters"],
      default:null
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
      lowercase:true,
      enum:['admin', 'teacher', 'student']
  },
    gender:{
      type: String,
      lowercase:true,
      enum:['male', 'female']
  },
    major:{
      type: String,
      lowercase:true
  },
    address:{
      type: String,
      lowercase:true
  },
    sections: {
      type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Section'
      }],
      default: []
  },
    department:{
        type:String,
        default:''
    },
    aboutme:{
        type:String,
        default:''
    },
    dob:{
        type:String
    },
    phonenumber:{
        type:String
    }


})

const sendEmail = async (email, password) =>{
    if(email == null)
        return
    var transporter = nodemailer.createTransport(
        {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service:'gmail',
            auth:{
                user:'bahaayaadvon@gmail.com',
                pass:'ykuw vbbz txnf iwkl'
            }
        }
    )
    await transporter.sendMail({
        from: 'educarejo@gmail.com',
        to: email,
        subject: "Your generated password",
        text: `Your generated password is ${password}:`, // plain text body
    })
}

userSchema.post('save', function(doc, next){
    this.password
    next();
})

userSchema.pre('save',async function (next) {
    if(this.password === null) {
        this.password = generator.generate({
            length: 6,
            numbers:true
        })
        await sendEmail(this.email, this.password)
    }
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();
  })
const deleteStudent = async (sections, id) =>{
    try{
        await Promise.all(sections.map(
            async (sectionId) =>{
                const les = await Section.updateOne(
                    {_id:sectionId},
                    {$pull: {
                            students:id
                        }}
                )
            }
        ))
    }catch (err){
        return err
    }
}

const deleteTeacher = async (sections, id) =>{
    try{
        await Promise.all(sections.map(
            async (sectionId) =>{
                mongoose.model('Sections').updateOne(
                    {_id:sectionId},
                    {$pull: {
                            teachers:id
                        }}
                )
            }
        ))

    }catch (err){
        return err
    }
}
userSchema.statics.deleteUserFromSections = async function(userId){
    if(!userId) return
    const user = await this.findOne({userId})
    if(!user.sections) return
    if(user.role === 'student')
        await deleteStudent(user.sections, user._id)
    if(user.role === 'teacher')
        await deleteTeacher(user.sections, user._id)
}

userSchema.statics.login = async function(userId, password) {
    const user = await this.findOne({userId});
    if(user){
       const auth = await bcrypt.compare(password, user.password);
       if(auth){
        return user;
       }
       throw Error('incorrect password');
    }
    throw Error('invalid userid');
}
const User = mongoose.model('user', userSchema);

module.exports = User;