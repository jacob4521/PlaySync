import axios from "axios";
import { log } from "console";
import type { Request, Response } from "express";

export const askAIAssistant = async (req: Request, res: Response) => {
  try {
    // Get the prompt prompt
    const userPrompt = req.body.prompt;
    if (!userPrompt || userPrompt.trim() === "") {
      return res.status(400).json({ error: "Invalid or missing prompt." });
    }

    // Send the prompt to the Python AI server using Axios
    const pythonResponse = await axios.post(
      "http://127.0.0.1:8000/ai/assistant",
      { prompt: userPrompt },
    );

    // sending the response back to the client
    res.status(200).json({ reply: pythonResponse.data.message });
  } catch (error) {
    // Error Handling
    console.error("Python AI Server Error:", error);
    res.status(500).json({ error: "AI Server is currently unreachable." });
  }
};
