const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main(content) {
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
     contents: `Summarize this in under 2000 characters:\n${content}`,
  });
  
    return response.text;
}
module.exports={main};
