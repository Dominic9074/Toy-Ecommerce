const SpeechRecognition =window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    console.error("[Jarvis] Speech Recognition is not supported.");
} else {
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    let isRunning = false;
    let shouldListen = true;

    recognition.onstart = () => {
        isRunning = true;

        console.log("[Jarvis] Wake-word listening started.");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();

        console.log("[Jarvis] Heard:", transcript);

        Jarvis.handleSpeech(transcript);
    };

    recognition.onerror = (event) => {
        console.error("[Jarvis] Speech error:", event.error);

        isRunning = false;

        // These errors mean we should stop trying automatically.
        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {
            shouldListen = false;
            console.error(
                "[Jarvis] Microphone permission/service unavailable."
            );
        }
    };

    recognition.onend = () => {
        isRunning = false;

        console.log("[Jarvis] Recognition ended.");

        if (shouldListen) {
            setTimeout(() => {
                startRecognition();
            }, 300);
        }
    };

   function startRecognition() {
        if (
            !shouldListen ||
            isRunning ||
            speechSynthesis.speaking
        ) {
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            console.log(
                "[Jarvis] Could not start recognition:",
                error.message
            );
        }
    }

    function stopRecognition() {
        shouldListen = false;

        if (isRunning) {
            recognition.stop();
        }
    }

    function pauseRecognition() {
        if (isRunning) {
            recognition.stop();
        }
    }

    window.jarvisSpeech = {
        start: startRecognition,
        stop: stopRecognition,
        pause: pauseRecognition
    };

    // Start automatically when the admin page loads.
    startRecognition();
}