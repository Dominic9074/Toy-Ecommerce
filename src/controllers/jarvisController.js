import { sendToLangflow } from "../services/langflowService.js";

export async function processJarvisCommand(req, res) {
    try {
        const { message, sessionId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Command is required"
            });
        }

        console.log("[Jarvis] Command:", message);

        const result = await sendToLangflow(
            message,
            sessionId || "jarvis-admin"
        );

        // Extract the final AI response from Langflow
        const aiResponse =
            result?.outputs?.[0]
                ?.outputs?.[0]
                ?.results?.message?.text;

        if (!aiResponse) {
            console.error(
                "[Jarvis] Could not extract AI response:",
                result
            );

            return res.status(500).json({
                success: false,
                message: "Could not read Langflow response"
            });
        }

        console.log("[Jarvis] AI:", aiResponse);

        return res.json({
            success: true,
            response: aiResponse
        });

    } catch (error) {
        console.error(
            "[Jarvis] Langflow error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to process Jarvis command"
        });
    }
}