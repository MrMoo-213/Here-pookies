export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
    });

    const xfo = response.headers.get("x-frame-options");
    const csp = response.headers.get("content-security-policy");

    var embeddable = true;

    if (xfo) {
      var xfoLower = xfo.toLowerCase();
      if (xfoLower.includes("deny") || xfoLower.includes("sameorigin")) {
        embeddable = false;
      }
    }

    if (csp && csp.toLowerCase().includes("frame-ancestors")) {
      // If frame-ancestors is present and doesn't include '*', treat as restricted
      var cspLower = csp.toLowerCase();
      if (!cspLower.includes("frame-ancestors *")) {
        embeddable = false;
      }
    }

    res.status(200).json({ embeddable: embeddable });
  } catch (err) {
    // If we can't even reach it, treat as not embeddable so we fall back to a direct visit
    res.status(200).json({ embeddable: false });
  }
}
