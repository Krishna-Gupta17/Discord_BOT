require("dotenv").config();
const { getToken } = require('./botlogin');
const {main}=require("./ai");
const axios = require('axios');
const { Client, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const shortid = require('shortid');
let token;
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });

client.on("messageCreate",async(message)=>{
  if(message.author.bot)  return;  // reply khud ko hi reply deta rahega
  if(message.content.startsWith("create")){
      const url=message.content.split("create ")[1];
       token = await getToken();
      console.log(token);
      const res = await axios.post(
  `${process.env.SERVER_URL}/URL`,
  { url, token },
  {
    headers: {
      "X-Requested-By": "axios-bot"
    },
    withCredentials: true
  }
);
      const shortId = res.data.shortId;
      console.log(shortId);
            return message.reply({
        content:"Generated Short Id" +" "+`${process.env.SERVER_URL}/URL/`+shortId,
      });
  }
  else {
    const content=message.content;
    const response=await main(content);
    return message.reply({
        content:response,
      });
  }
});


client.login(process.env.BOT_LOGIN);
