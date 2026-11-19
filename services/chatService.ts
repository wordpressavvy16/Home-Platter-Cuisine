import { apiClient } from '../api/client';

/**
 * Sends a message to the secure AI chat gateway and returns a streaming response.
 * @param message The user's message to send.
 * @returns An async iterable stream of response chunks.
 */
export const sendMessageStream = async (message: string) => {
    // All AI calls now go through our own backend gateway for security.
    const response = await apiClient('/api/ai/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });

    if (!response.body) {
        throw new Error("Streaming response not available.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Return an async generator that the UI can iterate over.
    const stream = (async function* () {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            // The backend is expected to stream newline-delimited JSON objects.
            const textChunk = decoder.decode(value);
            const jsonStrings = textChunk.split('\n').filter(s => s.trim());
            
            for (const jsonString of jsonStrings) {
                try {
                    const parsed = JSON.parse(jsonString);
                    // Yield the same object structure as the original implementation.
                    yield { text: parsed.text };
                } catch (e) {
                    console.error("Failed to parse stream chunk:", jsonString, e);
                }
            }
        }
    })();

    return stream;
};