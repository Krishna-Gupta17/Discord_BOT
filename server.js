require("dotenv").config();
const { getToken } = require('./botlogin');
const {main}=require("./ai");
const axios = require('axios');
const mongoose = require('mongoose');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define schema and model for threads
const threadSchema = new mongoose.Schema({
  userId: String,
  username: String,
  threadId: String,
  guildId: String,
  lastUpdated: Date
});

const ThreadModel = mongoose.model("UserThread", threadSchema);

const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
client.once("ready", () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate",async(message)=>{
  if(message.author.bot || !message.guild)  return;  // reply khud ko hi reply deta rahega
  const user = message.author; //2
  const content = message.content.trim();
  let thread;//4
  const record = await ThreadModel.findOne({ userId: user.id });//5
if (record) {
  try {
    thread = await message.guild.channels.fetch(record.threadId);
    // If user is already chatting inside their thread, skip the redirection message
    if (message.channel.id === record.threadId) {
      // let it continue to AI / create
    } else if (thread && !thread.archived) {
      if (content === "ready") {
        return message.reply(`👤 ${user.username}, your private thread is already created.`);
      } else {
        return message.reply(`📩 ${user.username}, please continue your conversation in your private thread.`);
      }
    } else {
      thread = null; // Archived or missing
    }
  } catch (e) {
    thread = null;
  }
}
  if (!record && content !== "ready") {
    return message.reply(`👋 ${user.username}, to talk with the bot personally, type \`ready\``);
  }
  // Create thread if not found or archived
  if (!thread && content ==="ready") {
    try {
      thread = await message.startThread({
        name: `${user.username}-chat`,
        autoArchiveDuration: 60,
        type: ChannelType.PrivateThread,
        reason: 'Private user thread'
      });

      await thread.members.add(user.id);

       await ThreadModel.findOneAndUpdate(
        { userId: user.id },
        {
          userId: user.id,
          username: user.username,
          threadId: thread.id,
          guildId: message.guild.id,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      await thread.send(`👋 Hello ${user.username}, welcome to your private thread!`);
    } catch (err) {
      console.error("Thread creation failed:", err);
      return message.reply(" Unable to create thread.");
    }
  }
  if(thread &&content.startsWith("create")){
      const url=content.split("create ")[1];
      if(!url) return thread.send("⚠️ Please provide a valid URL.");
    try{
      const token = await getToken();
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
            return thread.send(`🔗 Shortened URL: ${process.env.SERVER_URL}/URL/${shortId}`);
  } catch (err) {
      console.error("URL shortening failed:", err);
      return thread.send("⚠️ Failed to shorten the URL.");
    }
  } else if(thread){
    try{
    const response=await main(content);
     return thread.send(response);
    } catch(err){
      console.error("Gemini response error:", err);
      return thread.send("⚠️ Bot failed to respond due to api overloading.");
    }
  }
});


client.login(process.env.BOT_LOGIN);

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(process.env.PORT || 3000);
