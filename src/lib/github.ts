import { logger } from "./logger";

export async function getLatestRelease(owner: string, repo: string) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
        const headers: Record<string, string> = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "WhatsApp-System"
        };

        if (process.env.GITHUB_TOKEN) {
            headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const res = await fetch(url, {
            headers,
            cache: 'no-store'
        });

        if (res.status === 404) {
            // 404 is normal when no releases have been published yet on GitHub for this repo
            logger.info("GitHub", `No published releases found for ${owner}/${repo}`);
            return null;
        }

        if (!res.ok) {
            const errorText = await res.text();
            logger.warn("GitHub", `API Error: ${res.status} ${res.statusText} - ${errorText}`);
            return null;
        }

        const data = await res.json();
        return {
            tag_name: data.tag_name, // e.g. v1.0.1
            name: data.name,
            html_url: data.html_url,
            body: data.body,
            published_at: data.published_at
        };
    } catch (e) {
        logger.error("GitHub", "Error fetching GitHub release:", e);
        return null;
    }
}
