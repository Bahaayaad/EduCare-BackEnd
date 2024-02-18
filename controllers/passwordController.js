const generator = require("generate-password");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const generatePassword = async () =>{
    return  generator.generate({
        length: 6,
        numbers: true
    })


}
const encryptPassword = async (password)=>{
    const salt = await bcrypt.genSalt()
    try {
        return await bcrypt.hash(password, salt)
    }catch (err){
        console.log(err)
        return err
    }
}

const comparePassword = async (oldPassword, dbPassword) =>{
    return await bcrypt.compare(oldPassword, dbPassword)
}

module.exports.forgotPassword = async (req, res) =>{
    console.log("test")
    const email = req.body.email;
    try{
        const user = await User.findOne({email: email})
        if(!user){
            return res.status(404).json('Email is not assigned to any user')
        }
        try {
            const newPassword = await generatePassword();
            const encryptedPassword = await encryptPassword(newPassword);
            const updatedUser =await User.findOneAndUpdate({email: email}, {password: encryptedPassword}, {new: true}).exec()
            await User.sendEmail(email, newPassword)
            res.status(200).json(updatedUser)
        }catch(err){
            return res.status(500).json(err.message)
        }
    }catch (err){
        return res.status(404).json('Email is not assigned to any user')
    }
}

module.exports.resetPassword =async (req, res) =>{
    const {oldPassword, newPassword} = req.body
    try {
        const user = await User.findOne({userId: req.user}).select('password')
        if(!user){
            return res.status(401).json('Invalid User')
        }
        const compare = await comparePassword(oldPassword, user.password)
        if(!compare){
            return res.status(400).json('Password is incorrect')
        }
        const password = await encryptPassword(newPassword)
        const updatedUser = await User.findOneAndUpdate({userId: req.user}, {password: password},{new:true})
    }catch (err){
        return res.status(400).json.message(err.message)
    }

}