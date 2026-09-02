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

        // Send command to Langflow
        const result = await sendToLangflow(
            message,
            sessionId || "jarvis-admin"
        );

        // Extract final AI response
        const aiResponse =
            result?.outputs?.[0]
                ?.outputs?.[0]
                ?.results?.message?.text;

                const cleanResponse = aiResponse?.replace(/\*\*/g, "")?.replace(/__/g, "")?.replace(/`/g, "")?.trim();

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

        // Send ONLY text to browser
        return res.json({
            success: true,
            response: cleanResponse
        });

    } catch (error) {
        console.error(
            "[Jarvis] Command error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to process Jarvis command"
        });
    }
}