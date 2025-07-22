// authHelper.js
require("dotenv").config();
const axios = require('axios');
const {setUser,getuser}=require("./service/auth");

let token = null;

async function getToken() {
  if (token) return token;

  try {
    const res = await axios.post(`${process.env.SERVER_URL}/user/login`, {
  email: process.env.DUMMY_EMAIL,
  password: process.env.DUMMY_PASSWORD
}, {
    headers: {
      "X-Requested-By": "axios-bot"
    },
    withCredentials: true
  });
 const token = res.data.token;

    // (Optional) Save user data
    if (res.data.user) {
      setUser(res.data.user);
    }

    return token;

  } catch (error) {
    console.error('❌ Bot login failed:', error.response?.data || error.message);
    throw new Error('Authentication failed');
  }
}

module.exports = { getToken };
