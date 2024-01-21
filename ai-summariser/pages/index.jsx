import React, { useState } from "react";
import URLInput from "../components/URLInput";
import Button from "../components/Button";

export default function Main() {
  const [inputValue, setInputValue] = useState("");
  const [scrapedText, setScrapedText] = useState("");
  const [summary, setSummary] = useState(""); // New state for summary
  const [loading, setLoading] = useState(false);

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleButtonClick = async () => {
    setScrapedText("");
    setSummary(""); // Clear previous summary
    setLoading(true);

    const urlToScrape = inputValue;

    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(urlToScrape)}`);
      const htmlContent = await response.text();

      // Use DOM parsing to extract text from specific elements (e.g., paragraphs)
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const extractedText = Array.from(doc.querySelectorAll('p')).map(p => p.textContent).join('\n');

      // Process or display the extracted text
      setScrapedText(extractedText);

      // Generate and set summary
      const summary = await generateSummary(extractedText);
      setSummary(summary);

      // Add sticky note with the scraped content
      await addSticky(extractedText);
    } catch (error) {
      console.error("Error while scraping:", error);
    }

    setLoading(false);
  };

  async function generateSummary(text) {
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
        }),
      });
      const result = await response.json();
      return result.data.summary;
    } catch (error) {
      console.error("Error generating summary:", error);
      return "Summary not available";
    }
  }

  async function addSticky(content) {
    const stickyNote = await miro.board.createStickyNote({
      content: content,
    });

    await miro.board.viewport.zoomTo(stickyNote);
  }

  return (
    <div className="grid">
      <URLInput
        placeholder={"Enter URL to scrape"}
        value={inputValue}
        onChange={handleInputChange}
      />
      <Button onClick={handleButtonClick}>Scrape URL</Button>

      <div className="scraped-content-container cs1 ce12">
        {loading && <div className="spinner" />}
        {scrapedText && <div>{scrapedText}</div>}
        {summary && <div className="summary">{summary}</div>}
      </div>
    </div>
  );
}
