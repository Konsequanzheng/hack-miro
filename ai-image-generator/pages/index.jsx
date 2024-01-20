import React, { useState, useEffect } from "react";
import PromptInput from "../components/PromptInput";
import Button from "../components/Button";
import Renderer from "../components/Renderer";

 

async function checkIfAssetIsOverBox(magicboxOld) {
  const items = await miro.board.get({
    type: ['image', 'sticky_note'],
  });
  const magicbox = await miro.board.getById(magicboxOld.id);
  if(magicbox === null) {
    return;
  }
  console.log(items);

  for(var index in items) {
    const item = items[index];
    if(Math.abs(item.x - magicbox.x) < item.width/2 + magicbox.width/2 
    && Math.abs(item.y - magicbox.y) < item.height/2 + magicbox.height/2) {
      if(item.type === "sticky_note") {
        console.log(item.content);
      }
    }
  }
  
}

export default function Main() {
  const [inputValue, setInputValue] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
    window.miro.board.ui.on("icon:click", async () => {
      const magicBox = await miro.board.createImage({
        title: 'Magic Box',
        url: 'https://as1.ftcdn.net/v2/jpg/05/72/14/12/1000_F_572141234_oRsM7v29Ed0j1rYDcAhZwaO1VtBOSZaw.jpg',
        x: 0, // Default value: horizontal center of the board
        y: 0, // Default value: vertical center of the board
        width: 100, // Set either 'width', or 'height'
        rotation: 0.0,
      });

      setInterval(checkIfAssetIsOverBox, 5000, magicBox);
      window.miro.board.ui.openPanel({
        url: `/?panel=1`,
      });
    });
  }, []);

  // Register the drop event handler once.
  useEffect(() => {
    window.miro.board.ui.on("drop", drop);
  }, []);

  //drag and drop logic
  const drop = async ({ x, y, target }) => {
    setLoading(true);

    if (target instanceof HTMLImageElement) {
      const image = await window.miro.board.createImage({
        x,
        y,
        url: target.src,
      });
      await window.miro.board.viewport.zoomTo(image);
    }
    setLoading(false);
  };

  //handles the prompt input being typed in
  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleButtonClick = async () => {
    setImage("");
    setLoading(true);

    // post our prompt to our backend
    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputValue }),
      });

      //get the response back from backend, which has the URL which we are looking for
      const { data: imageUrl } = await response.json();

      //set the image src to the URL which is returned by OpenAI call
      setImage(imageUrl);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <div className="grid">
      {/* React component which takes the user input and uses that as a prompt for OpenAI image generation */}
      <PromptInput
        placeholder={"Van Gogh inspired portrait of a dog"}
        value={inputValue}
        onChange={handleInputChange}
      />

      {/* Button which calls the OpenAI backend (pages/api/openai.js) with the prompt */}
      <Button onClick={handleButtonClick}>Generate Image</Button>

      <div className="image-container cs1 ce12">
        {/* Spinner needs to be hidden by default, otherwise will spin when opening app first time */}
        {Boolean(loading) && <div className="spinner" />}
        {/* Img which needs to be draggable */}
        {Boolean(image) && <img className="miro-draggable" src={image} />}
      </div>

      <Renderer></Renderer>
      
    </div>
  );
}
