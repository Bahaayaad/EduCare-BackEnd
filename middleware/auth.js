const jwt = require("jsonwebtoken");

const config = process.env;

const verifyTokenAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  //console.log("body here: %j", req.cookies)
  // console.log("lets see this : "+ req.cookies)

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
    const secret ="EduCareSecret101";
    jwt.verify(token, secret, (err, decodedToken) => {
        if(err){
            console.log("here's what I got : " + err);
            return res.status(401).send("Invalid Token");
        }else{
          req.user = decodedToken.id;
             return next();
        }
    });

};

module.exports = {verifyTokenAuth};