/**
 * Spintax (Spin Syntax) Engine for WhatsApp Messages
 * 
 * Converts patterns like "{Hello|Hi|Hey} {friend|customer}, {how are you|hope you're doing well}!"
 * into randomized unique text messages to prevent identical message hash detection by WhatsApp algorithms.
 */

const SPINTAX_REGEX = /\{([^{}]+)\}/;

/**
 * Resolves all spintax tags in a string, picking a random choice for each.
 * Supports nested spintax: "{Hello|{Hi|Hey}}"
 */
export function resolveSpintax(text: string): string {
    if (!text || typeof text !== "string") return text || "";

    let result = text;
    let iterations = 0;
    const MAX_ITERATIONS = 50; // Safeguard against infinite loops in malformed input

    while (SPINTAX_REGEX.test(result) && iterations < MAX_ITERATIONS) {
        result = result.replace(SPINTAX_REGEX, (_, match) => {
            const choices = match.split("|");
            const picked = choices[Math.floor(Math.random() * choices.length)];
            return picked.trim();
        });
        iterations++;
    }

    return result;
}

/**
 * Checks whether a text string contains spintax notation.
 */
export function containsSpintax(text: string): boolean {
    if (!text || typeof text !== "string") return false;
    return /\{[^{}]+\|[^{}]+\}/.test(text);
}

/**
 * Generates N unique sample variations for preview/testing purposes.
 */
export function generateSpintaxVariations(text: string, count: number = 3): string[] {
    if (!text) return [];
    if (!containsSpintax(text)) return [text];

    const variations = new Set<string>();
    const maxTries = count * 15;
    let tries = 0;

    while (variations.size < count && tries < maxTries) {
        variations.add(resolveSpintax(text));
        tries++;
    }

    return Array.from(variations);
}
