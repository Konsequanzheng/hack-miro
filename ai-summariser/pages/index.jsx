import React, { useState } from "react";
import URLInput from "../components/URLInput";
import Button from "../components/Button";

export default function Main() {
  const [inputValue, setInputValue] = useState("");
  const [scrapedText, setScrapedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleButtonClick = async () => {
    setScrapedText("");
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
    } catch (error) {
      console.error("Error while scraping:", error);
    }

    setLoading(false);
  };

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
      </div>
    </div>
  );
}
