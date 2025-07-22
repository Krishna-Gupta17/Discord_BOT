//Stateless
require("dotenv").config();
const jwt= require('jsonwebtoken'); //1
const secret=process.env.SECRET_KEY;
//token assignment
function setUser(user){
 return jwt.sign({
  _id:user._id,
  email:user.email,
 },secret);
}
function getUser(token){
    if(!token) return null;
    return jwt.verify(token,secret);
}
module.exports={
  setUser,getUser,
}