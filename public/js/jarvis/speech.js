const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    console.log("[Jarvis] Speech Recognition is not supported.");
} else {
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        console.log("[Jarvis] Listening...");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();

        console.log("[Jarvis] Heard:", transcript);

        const text = transcript.toLowerCase();

        if (text.includes("jarvis")) {
            console.log("[Jarvis] WAKE WORD DETECTED!");
        }
    };

    recognition.onerror = (event) => {
        console.error("[Jarvis] Speech error:", event.error);
    };

    recognition.onend = () => {
        console.log("[Jarvis] Recognition ended.");
    };

    window.jarvisSpeech = {
        start() {
            try {
                recognition.start();
            } catch (error) {
                console.error("[Jarvis] Could not start:", error);
            }
        }
    };
}