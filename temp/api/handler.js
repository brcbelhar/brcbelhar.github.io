export default async function handler(req, res) {
    const scriptUrl = process.env.SCRIPT_URL;

    if (!scriptUrl) {
        return res.status(500).json({ error: "SCRIPT_URL not configured" });
    }

    try {
        let response;
        if (req.method === 'POST') {
            // Forward POST as JSON (Matching your frontend script.js)
            response = await fetch(scriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body) 
            });
        } else {
            // Forward GET request with query parameters (for Searching)
            const queryString = new URLSearchParams(req.query).toString();
            response = await fetch(`${scriptUrl}?${queryString}`);
        }

        // Google Apps Script always returns a 302 redirect first, 
        // but modern fetch handles the redirect automatically.
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: "Failed to connect to Google Script" });
    }
}
