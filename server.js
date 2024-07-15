const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let genAI;

app.post('/api/set-key', (req, res) => {
    const { apiKey } = req.body;
    genAI = new GoogleGenerativeAI(apiKey);
    res.json({ message: "API key set successfully" });
});

app.post('/api/chat', async (req, res) => {
    if (!genAI) {
        return res.status(400).json({ error: "API key not set" });
    }

    const { message } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        res.json({ reply: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "An error occurred while processing your request" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${port}`);
});