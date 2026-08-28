let jarvisMode = "wake";

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
            }
        }, 900);
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

    async sendCommand(text) {
    console.log("[Jarvis] Sending to AI:", text);

    document.body.classList.remove("jarvis-waking");
    document.body.classList.remove("jarvis-listening");
    document.body.classList.add("jarvis-thinking");

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

        console.log("[Jarvis] AI says:", data.response);

        // Temporary: show the response in a browser alert
        alert(data.response);

        } catch (error) {
            console.error("[Jarvis] AI error:", error);

            alert("Sorry sir, I couldn't process that command.");

        } finally {
            // Return to command/listening mode
            if (jarvisMode === "command") {
                document.body.classList.remove("jarvis-thinking");
                document.body.classList.add("jarvis-listening");

                console.log("[Jarvis] Ready for next command.");
            }
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