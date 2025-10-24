import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import OpenAI from "openai";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || "https://api.openai.com/v1",
});

app.post("/wallet_balance", async (req, res) => {
  try {
    const { contract, chain } = req.body;
    if (!contract || !chain) return res.status(400).json({ error: "Missing contract or chain" });
    const url = `${process.env.COINGECKO_API}/simple/token_price/${chain}?contract_addresses=${contract}&vs_currencies=usd`;
    const { data } = await axios.get(url);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallet data" });
  }
});

app.post("/summarize", async (req, res) => {
  const { portfolio } = req.body;
  try {
    const chat = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: "You are a crypto financial assistant." },
        {
          role: "user",
          content: `Summarize this portfolio in one paragraph: ${JSON.stringify(portfolio)}`,
        },
      ],
    });
    res.json({ summary: chat.choices[0].message.content });
  } catch (error) {
    console.error("AI summary error:", error.message);
    res.status(500).json({
      error: "Model call failed. Please check your OpenRouter access or model ID.",
    });
  }
});


const PORT = process.env.PORT || 3000;
app.use(express.static("."));
app.listen(PORT, () => console.log(`🚀 Aya Crypto Agent running on http://localhost:${PORT}`));
