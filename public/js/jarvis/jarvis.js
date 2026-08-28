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

        // We will connect this to the AI later.
    }
};