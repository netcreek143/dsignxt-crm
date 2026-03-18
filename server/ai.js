import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

let genAI;
let geminiModel;

const initGemini = () => {
    if (!genAI) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) return null;
        genAI = new GoogleGenerativeAI(key);
        geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    }
    return geminiModel;
};

// Generic completion function to handle different providers
const getCompletion = async (prompt, systemPrompt = "") => {
    // 1. Try Groq (Llama 3) - Very fast and generous free tier
    if (process.env.GROQ_API_KEY) {
        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                })
            });
            if (res.ok) {
                const data = await res.json();
                return data.choices[0].message.content;
            }
        } catch (e) { console.error("Groq Error:", e.message); }
    }

    // 2. Try Gemini (Google) - Good fallback/primary
    const ai = initGemini();
    if (ai) {
        try {
            const result = await ai.generateContent(systemPrompt + "\n\n" + prompt);
            return result.response.text();
        } catch (e) { console.error("Gemini Error:", e.message); }
    }

    // 3. Try Mistral - Another excellent free tier
    if (process.env.MISTRAL_API_KEY) {
        try {
            const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "open-mistral-7b",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ]
                })
            });
            if (res.ok) {
                const data = await res.json();
                return data.choices[0].message.content;
            }
        } catch (e) { console.error("Mistral Error:", e.message); }
    }

    throw new Error("No AI provider available or all quotas exceeded.");
};

export const analyzeLead = async (lead) => {
    const systemPrompt = "You are an expert CRM assistant. Analyze lead data concisely.";
    const prompt = `
    Analyze the following lead data and provide a concise summary, sentiment analysis, and recommended next steps.
    
    Lead Data:
    - Name: ${lead.fullName}
    - Email: ${lead.email}
    - Source: ${lead.sourceLabel} (${lead.sourceType})
    - Temperature: ${lead.temperature}
    - Status: ${lead.statusId}
    - Custom Data: ${lead.customData}
    
    Format the response in clear bullet points.
    `;

    try {
        return await getCompletion(prompt, systemPrompt);
    } catch (e) {
        console.error("AI Analysis Error:", e);
        return "Failed to analyze lead due to an AI service error.";
    }
};

export const getChatResponse = async (query, leads, role) => {
    const context = leads.map(l => ({
        name: l.fullName,
        email: l.email,
        source: l.sourceLabel,
        status: l.statusId,
        temperature: l.temperature
    }));

    const systemPrompt = `
    You are the DSignXT CRM Assistant. You are chatting with a ${role}.
    Context of available leads: ${JSON.stringify(context, null, 2)}
    
    Instructions:
    - Summarize leads or find specific prospects based on query.
    - Professional, helpful, concise.
    - No technical JSON mentions.
    `;

    try {
        return await getCompletion(query, systemPrompt);
    } catch (e) {
        console.error("AI Chat Error:", e);
        if (e.message.includes("quotas")) {
            return "I'm sorry, I've used up my free AI power for now. Please try again in a moment or check the API keys.";
        }
        return "I encountered an error while processing your request. Please try again later.";
    }
};
