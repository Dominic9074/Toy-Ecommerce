let jarvisMode = "wake";

function createWavFile(
    pcmData,
    sampleRate,
    numChannels,
    bitsPerSample
) {
    const bytesPerSample =
        bitsPerSample / 8;

    const blockAlign =
        numChannels * bytesPerSample;

    const byteRate =
        sampleRate * blockAlign;

    const dataSize =
        pcmData.length;

    const buffer =
        new ArrayBuffer(44 + dataSize);

    const view =
        new DataView(buffer);

    function writeString(offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(
                offset + i,
                string.charCodeAt(i)
            );
        }
    }

    // RIFF header
    writeString(0, "RIFF");

    view.setUint32(
        4,
        36 + dataSize,
        true
    );

    writeString(8, "WAVE");

    // fmt chunk
    writeString(12, "fmt ");

    view.setUint32(
        16,
        16,
        true
    );

    // PCM format
    view.setUint16(
        20,
        1,
        true
    );

    view.setUint16(
        22,
        numChannels,
        true
    );

    view.setUint32(
        24,
        sampleRate,
        true
    );

    view.setUint32(
        28,
        byteRate,
        true
    );

    view.setUint16(
        32,
        blockAlign,
        true
    );

    view.setUint16(
        34,
        bitsPerSample,
        true
    );

    // data chunk
    writeString(36, "data");

    view.setUint32(
        40,
        dataSize,
        true
    );

    // Copy PCM data
    new Uint8Array(buffer, 44).set(
        pcmData
    );

    return buffer;
}

const Jarvis = {
    getMode() {
        return jarvisMode;
    },

    wake() {
        if (jarvisMode === "command") {
            return;
        }

        jarvisMode = "command";

        console.log("[Jarvis] Mode: COMMAND");

        document.body.classList.remove(
            "jarvis-thinking",
            "jarvis-listening"
        );

        document.body.classList.add("jarvis-waking");

        // After the wake animation finishes,
        // switch to the normal listening animation.
        setTimeout(() => {
            if (jarvisMode === "command") {
                document.body.classList.remove("jarvis-waking");
                document.body.classList.add("jarvis-listening");

                console.log("[Jarvis] Ready for command.");

                this.greet();
            }
        }, 900);
    },

    acknowledge() {
        const responses = [
            "Certainly, sir. I'm checking that now.",
            "Certainly, sir. Let me check that for you.",
            "Of course, sir. I'm looking into it.",
            "Right away, sir. Let me check.",
            "Certainly, sir. One moment."
        ];

        const response =
            responses[Math.floor(Math.random() * responses.length)];

        console.log("[Jarvis] Acknowledgement:", response);

        this.speak(response);
    },

    sleep() {
        jarvisMode = "wake";

        console.log("[Jarvis] Going to sleep.");
        console.log("[Jarvis] Mode: WAKE");

        document.body.classList.remove(
            "jarvis-waking",
            "jarvis-listening",
            "jarvis-thinking"
        );
    },

   speak(text) {
        if (!text) {
            return;
        }

        console.log("[Jarvis] Speaking:", text);

        document.body.classList.remove(
            "jarvis-thinking",
            "jarvis-listening"
        );

        document.body.classList.add("jarvis-speaking");

        const utterance = new SpeechSynthesisUtterance(text);

        const voices = speechSynthesis.getVoices();

        const jarvisVoice = voices.find(
            voice => voice.name === "Google UK English Male"
        );

        if (jarvisVoice) {
            utterance.voice = jarvisVoice;
        }

        utterance.lang = "en-GB";
        utterance.rate = 1.1;
        utterance.pitch = 0.75;
        utterance.volume = 1;

        speechSynthesis.cancel();

        utterance.onend = () => {
            console.log("[Jarvis] Voice playback finished.");

            if (jarvisMode === "command") {
                document.body.classList.remove(
                    "jarvis-speaking"
                );

                document.body.classList.add(
                    "jarvis-listening"
                );
            }
        };

        utterance.onerror = (event) => {
            console.error(
                "[Jarvis] Speech synthesis error:",
                event
            );

            document.body.classList.remove(
                "jarvis-speaking"
            );

            if (jarvisMode === "command") {
                document.body.classList.add(
                    "jarvis-listening"
                );
            }
        };

        speechSynthesis.speak(utterance);
    },

    greet() {
        const hour = new Date().getHours();

        let greeting;

        if (hour >= 5 && hour < 12) {
            greeting =
                "Good morning, sir. How may I assist you today?";
        } else if (hour >= 12 && hour < 17) {
            greeting =
                "Good afternoon, sir. How may I assist you today?";
        } else {
            greeting =
                "Good evening, sir. How may I assist you today?";
        }

        console.log("[Jarvis] Greeting:", greeting);

        this.speak(greeting);
    },

    async sendCommand(text) {
        console.log("[Jarvis] Sending to AI:", text);

        // --------------------------------
        // 1. Immediately acknowledge command
        // --------------------------------

        this.acknowledge();

        // --------------------------------
        // 2. Send command to Langflow
        // --------------------------------

        try {
            const response = await fetch("/api/jarvis/command", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: text,
                    sessionId: "jarvis-admin"
                })
            });

            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}`
                );
            }

            const data = await response.json();

            console.log("[Jarvis] AI response:", data);

            if (!data.success || !data.response) {
                throw new Error("Invalid AI response");
            }

            console.log(
                "[Jarvis] AI says:",
                data.response
            );

            // --------------------------------
            // 3. Speak the AI response
            // --------------------------------

            this.speak(data.response);

        } catch (error) {
            console.error(
                "[Jarvis] AI error:",
                error
            );

            this.speak(
                "I'm sorry, sir. I couldn't process that command."
            );
        }
    },


    handleSpeech(text) {
        const command = text.toLowerCase().trim();

        console.log("[Jarvis] Processing:", command);

        /*
         * WAKE MODE
         * --------------------------------
         * Only wake phrases are accepted.
         */
        if (jarvisMode === "wake") {
            if (
                command.includes("jarvis") ||
                command.includes("hey jarvis")
            ) {
                this.wake();
            }

            return;
        }

        /*
         * COMMAND MODE
         * --------------------------------
         * Jarvis is already awake.
         */

        // Sleep commands
        if (
            command.includes("go to sleep") ||
            command === "sleep" ||
            command.includes("jarvis go to sleep")
        ) {
            this.sleep();
            return;
        }

        // Normal command
        console.log("[Jarvis] Command received:", text);

        this.sendCommand(text);
    }
};