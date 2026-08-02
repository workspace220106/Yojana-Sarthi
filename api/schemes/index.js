import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'embeddings', 'chunks_metadata.json');
    if (!fs.existsSync(filePath)) {
      return res.status(200).json([]);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const chunks = JSON.parse(fileContent);

    const uniqueSchemes = {};
    for (const c of chunks) {
      const title = c.title;
      if (!title) continue;

      if (!uniqueSchemes[title]) {
        const metadata = c.metadata || {};
        const categories = metadata.categories || ["Other"];
        const category = categories[0] || "Other";

        uniqueSchemes[title] = {
          id: c.slug || title.toLowerCase().replace(/\s+/g, '-'),
          name: title,
          category: category,
          benefit: "Financial Assistance / Subsidy",
          benefit_amount: 5000,
          eligibility: "VJNT/SC/ST/OBC category resident of Maharashtra.",
          age_min: 18,
          age_max: 65,
          income_max: 800000,
          occupation: "All",
          category_target: "All",
          priority: "Medium",
          documents: ["Aadhaar Card", "Income Certificate", "Caste Certificate"],
          details: "Click view details or refer to official department portal.",
          sections: {}
        };
      }

      const section = c.section;
      const text = c.text || "";
      uniqueSchemes[title].sections[section] = text;

      if (section === "Benefits") {
        uniqueSchemes[title].benefit = text.length > 120 ? text.substring(0, 120) + "..." : text;
        uniqueSchemes[title].details = text;
        const amtMatches = text.match(/(?:₹|Rs\.?)\s*([\d,]+)/);
        if (amtMatches && amtMatches[1]) {
          const amt = parseInt(amtMatches[1].replace(/,/g, ''), 10);
          if (!isNaN(amt)) {
            uniqueSchemes[title].benefit_amount = amt;
          }
        }
      } else if (section === "Eligibility") {
        uniqueSchemes[title].eligibility = text.length > 150 ? text.substring(0, 150) + "..." : text;
        const ageMatches = text.toLowerCase().match(/(\d+)\s*(?:to|-)\s*(\d+)\s*years/);
        if (ageMatches && ageMatches[1] && ageMatches[2]) {
          uniqueSchemes[title].age_min = parseInt(ageMatches[1], 10);
          uniqueSchemes[title].age_max = parseInt(ageMatches[2], 10);
        } else {
          const ageMinMatch = text.toLowerCase().match(/age\s*(?:above|of|at least)\s*(\d+)/);
          if (ageMinMatch && ageMinMatch[1]) {
            uniqueSchemes[title].age_min = parseInt(ageMinMatch[1], 10);
          }
        }
      } else if (section === "Documents Required") {
        const docs = text.split("\n")
          .map(line => line.trim().replace(/^[-*•]\s*/, '').trim())
          .filter(line => line.length > 0 && line.length < 80);
        if (docs.length > 0) {
          uniqueSchemes[title].documents = docs.slice(0, 6);
        }
      }
    }

    const schemesList = Object.values(uniqueSchemes).sort((a, b) => a.name.localeCompare(b.name));
    return res.status(200).json(schemesList);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return res.status(500).json({ error: 'Failed to load schemes' });
  }
}
