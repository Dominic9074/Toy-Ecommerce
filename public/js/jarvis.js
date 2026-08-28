(() => {

    "use strict";


    /* =================================================
       ELEMENTS
    ================================================= */

    const overlay =
        document.getElementById(
            "jarvis-overlay"
        );

    const stateText =
        document.getElementById(
            "jarvis-state"
        );

    const messageText =
        document.getElementById(
            "jarvis-message"
        );

    const voiceStatus =
        document.getElementById(
            "jarvis-voice-status"
        );

    const voiceStatusText =
        document.getElementById(
            "jarvis-voice-status-text"
        );


    /* =================================================
       JARVIS STATE
    ================================================= */

    const JarvisState = {

        SLEEPING:
            "sleeping",

        WAKING:
            "waking",

        LISTENING:
            "listening",

        THINKING:
            "thinking",

        SPEAKING:
            "speaking"

    };


    let currentState =
        JarvisState.SLEEPING;


    /* =================================================
       SET STATE
    ================================================= */

    function setState(
        state,
        message = ""
    ) {

        currentState =
            state;


        /* Remove previous states */

        overlay.classList.remove(
            "jarvis-active",

            "jarvis-listening",

            "jarvis-thinking",

            "jarvis-speaking"
        );


        /* ---------------------------------------------
           SLEEPING
        --------------------------------------------- */

        if (
            state ===
            JarvisState.SLEEPING
        ) {

            stateText.textContent =
                "Sleeping";

            messageText.textContent =
                "";

            voiceStatusText.textContent =
                "Jarvis";

            voiceStatus.classList.remove(
                "jarvis-awake"
            );

            return;

        }


        /* ---------------------------------------------
           ACTIVE
        --------------------------------------------- */

        overlay.classList.add(
            "jarvis-active"
        );

        voiceStatus.classList.add(
            "jarvis-awake"
        );


        /* ---------------------------------------------
           WAKING
        --------------------------------------------- */

        if (
            state ===
            JarvisState.WAKING
        ) {

            stateText.textContent =
                "Waking up";

            messageText.textContent =
                message;

            voiceStatusText.textContent =
                "Waking";

            return;

        }


        /* ---------------------------------------------
           LISTENING
        --------------------------------------------- */

        if (
            state ===
            JarvisState.LISTENING
        ) {

            overlay.classList.add(
                "jarvis-listening"
            );

            stateText.textContent =
                "Listening";

            messageText.textContent =
                message;

            voiceStatusText.textContent =
                "Listening";

            return;

        }


        /* ---------------------------------------------
           THINKING
        --------------------------------------------- */

        if (
            state ===
            JarvisState.THINKING
        ) {

            overlay.classList.add(
                "jarvis-thinking"
            );

            stateText.textContent =
                "Thinking";

            messageText.textContent =
                message;

            voiceStatusText.textContent =
                "Thinking";

            return;

        }


        /* ---------------------------------------------
           SPEAKING
        --------------------------------------------- */

        if (
            state ===
            JarvisState.SPEAKING
        ) {

            overlay.classList.add(
                "jarvis-speaking"
            );

            stateText.textContent =
                "Speaking";

            messageText.textContent =
                message;

            voiceStatusText.textContent =
                "Speaking";

        }

    }


    /* =================================================
       GREETING
    ================================================= */

    function getGreeting() {

        const hour =
            new Date().getHours();


        if (
            hour < 12
        ) {

            return "Good morning";

        }


        if (
            hour < 17
        ) {

            return "Good afternoon";

        }


        return "Good evening";

    }


    /* =================================================
       WAKE JARVIS
    ================================================= */

    function wakeJarvis() {

        const greeting =
            getGreeting();


        setState(
            JarvisState.WAKING,
            `${greeting}, sir.`
        );


        setTimeout(() => {

            setState(
                JarvisState.LISTENING,
                "How can I help you?"
            );

        }, 900);

    }


    /* =================================================
       SLEEP JARVIS
    ================================================= */

    function sleepJarvis() {

        setState(
            JarvisState.SLEEPING
        );

    }


    /* =================================================
       TEST
    ================================================= */

    window.Jarvis = {

        wake:
            wakeJarvis,

        sleep:
            sleepJarvis,

        setState:
            setState,

        states:
            JarvisState

    };


    /* =================================================
       INITIAL STATE
    ================================================= */

    setState(
        JarvisState.SLEEPING
    );


})();