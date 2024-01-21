import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

async function generateSummary(text) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You need to generate a summary of this text under 100 words." },
        { role: "user", content: text },
      ],
      model: "gpt-4",
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}

export default async (req, res) => {
  // grab URL or prompt from the front end
  let urlToScrape = await req.body.urlToScrape;

  try {
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(urlToScrape)}`);
    const htmlContent = await response.text();

    // Use DOM parsing to extract text from specific elements (e.g., paragraphs)
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const extractedText = Array.from(doc.querySelectorAll('p')).map(p => p.textContent).join('\n');

    // Generate summary using OpenAI
    const summary = await generateSummary(extractedText);

    // send summary to front end
    res.status(200).json({
      success: true,
      data: {
        summary: summary,
      },
    });
  } catch (error) {
    console.error("Error while processing:", error);
    // send error to front end, so the user can easily see that something went wrong
    res.status(400).json({
      success: false,
      error: "Failed to generate summary",
    });
  }
};
