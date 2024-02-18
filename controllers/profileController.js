const User = require("../models/User");
module.exports.profileView = async (req, res) =>{
    try {
        const user = await User.findOne({userId: req.params.id})
        res.status(200).json(user)
    }catch (err){
        console.log('some error happened: ' + err)
        res.status(500).json(err.message)
    }
}

module.exports.profileEdit = async (req, res) =>{
    try {
        const curUser = await User.findById(req.user).select('userId')
        const profileUser = req.params.id
        if (curUser.userId !== profileUser) {
            res.status(401).json('invalid user')
        }
        const updateProfileData = req.body
        const updatedProfile = await User.updateOne({userId: profileUser}, updateProfileData, {new:true})
        if(!updatedProfile){
            res.status(400).json('User not found')
        }
        res.status(200).json(updatedProfile)
    }catch (err){
        res.status(500).json(err.message)
    }
}