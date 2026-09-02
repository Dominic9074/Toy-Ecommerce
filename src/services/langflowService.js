// const LANGFLOW_URL = process.env.LANGFLOW_URL;
// const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;
// const LANGFLOW_FLOW_ID = process.env.LANGFLOW_FLOW_ID;

// export async function sendToLangflow(message, sessionId) {
//     const url =`${LANGFLOW_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`;

//     const payload = {
//         output_type: "chat",
//         input_type: "chat",
//         input_value: message,
//         session_id: sessionId
//     };

//     const response = await fetch(url, {
//         method: "POST",

//         headers: {
//             "Content-Type": "application/json",
//             "x-api-key": LANGFLOW_API_KEY
//         },

//         body: JSON.stringify(payload)
//     });

//     if (!response.ok) {
//         const errorText = await response.text();

//         throw new Error(
//             `Langflow ${response.status}: ${errorText}`
//         );
//     }

//     return await response.json();
// }


const LANGFLOW_URL = process.env.LANGFLOW_URL;
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;
const LANGFLOW_FLOW_ID = process.env.LANGFLOW_FLOW_ID;

export async function sendToLangflow(message, sessionId) {
    const url =
        `${LANGFLOW_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`;

    const payload = {
        output_type: "chat",
        input_type: "chat",
        input_value: message,
        session_id: sessionId
    };

    console.log("[Langflow] Sending request...");
    console.log("[Langflow] URL:", url);
    console.log("[Langflow] Message:", message);

    const start = Date.now();

    const response = await fetch(url, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "x-api-key": LANGFLOW_API_KEY
        },

        body: JSON.stringify(payload)
    });

    const elapsed = Date.now() - start;

    console.log(
        `[Langflow] Response received in ${elapsed} ms`
    );

    console.log(
        "[Langflow] HTTP status:",
        response.status
    );

    const responseText = await response.text();

    console.log(
        "[Langflow] Raw response:",
        responseText
    );

    if (!response.ok) {
        throw new Error(
            `Langflow ${response.status}: ${responseText}`
        );
    }

    return JSON.parse(responseText);
}