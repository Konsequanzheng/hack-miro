import React, { useState, useEffect, useRef } from "react";
import PromptInput from "../components/PromptInput";
import Button from "../components/Button";
import Renderer from "../components/Renderer";
import Dropdown from "../components/DropdownMenu";
import Replicate from "replicate";
import * as DOMPurify from "dompurify";

export default function Main() {
  const [inputValue, setInputValue] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState("");
  const [title, setTitle] = useState("");
  var firstLoad = useRef(false);
  const dropdownOptions = Array(
    "DallE",
    "Shap-E",
    "GaussianDream",
    "Choir",
    "Describe Image",
    "Mind Map"
  );
  const magicBoxCreated = useRef(false);
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  useEffect(async () => {
    window.miro.board.ui.on("icon:click", async () => {
      console.log("we are running this");
      var magicBox;
      magicBox = (await miro.board.get({ type: ["image"] })).find(
        (element) => element.title === "Magic Box"
      );
      if (magicBox === undefined) {
        magicBox = await miro.board.createImage({
          title: "Magic Box",
          url: "https://as1.ftcdn.net/v2/jpg/05/72/14/12/1000_F_572141234_oRsM7v29Ed0j1rYDcAhZwaO1VtBOSZaw.jpg",
          x: 0, // Default value: horizontal center of the board
          y: 0, // Default value: vertical center of the board
          width: 100, // Set either 'width', or 'height'
          rotation: 0.0,
        });
        console.log("new box");
        
      }
      window.miro.board.viewport.zoomTo(magicBox);

      if (!magicBoxCreated.current) {
        setInterval(checkIfAssetIsOverBox, 5000);
        magicBoxCreated.current = true;

        console.log("set polling");
        // console.log(currIntervalGlobal);
        // firstInterval.current = true;
      }
      window.miro.board.ui.openPanel({
        url: `/?panel=1`,
      });
    });
  }, []);

  // Register the drop event handler once.
  useEffect(() => {
    window.miro.board.ui.on("drop", drop);
  }, []);

  useEffect(() => {
    placeStickyNote();
  }, [asset]);

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

  async function checkIfAssetIsOverBox() {
    console.log("ping");
    const items = await window.miro.board.get({
      type: ["image", "sticky_note"],
    });
    const magicbox = (
      await window.miro.board.get({
        type: ["image"],
      })
    ).find((item) => item.title === "Magic Box");

    const setting = (
      await window.miro.board.get({
        type: ["sticky_note"],
        tags: ["Setting"],
      })
    )[0];

    if (
      magicbox === null ||
      setting === null ||
      magicbox === undefined ||
      setting === undefined
    ) {
      return;
    }

    for (var index in items) {
      const item = items[index];
      if (
        Math.abs(item.x - magicbox.x) < item.width / 2 + magicbox.width / 2 &&
        Math.abs(item.y - magicbox.y) < item.height / 2 + magicbox.height / 2
      ) {
        var model = setting.content.replace(/(<([^>]+)>)/gi, "");
        console.log(model);
        switch (model) {
          case dropdownOptions[0]:
            if (item.type === "sticky_note") {
              const prompt = item.content.replace(/(<([^>]+)>)/gi, "");
              console.log(prompt);
              await window.miro.board.remove(item);
              const response = await fetch("/api/openai", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: prompt }),
              });
              //get the response back from backend, which has the URL which we are looking for
              const { data: imageUrl } = await response.json();

              setAsset(imageUrl);
              setTitle(prompt);
            }
            break;
          case dropdownOptions[1]:
            if (item.type === "sticky_note") {
              const prompt = item.content.replace(/(<([^>]+)>)/gi, "");
              console.log(prompt);
              await window.miro.board.remove(item);
              const response = await fetch("/api/replicate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: prompt }),
              });
              //get the response back from backend, which has the URL which we are looking for
              const { data: imageUrl } = await response.json();

              setAsset(imageUrl);
              setTitle(prompt);
            }
          case dropdownOptions[2]:
            break;
          case dropdownOptions[3]:
            break;
          default:
            break;
        }
      }
    }
  }

  const placeStickyNote = async () => {
    const position = await miro.board.experimental.findEmptySpace({
      x: 0,
      y: 0,
      width: 1024,
      height: 1024,
    });
    // If the board is empty then
    // position has the following properties:
    // {
    //   x: 0,
    //   y: 0,
    //   width: 200,
    //   height: 200
    // }
    console.log(position);
    const image = await window.miro.board.createImage({
      title: title,
      x: position.x,
      y: position.y,
      url: asset,
    });
    await window.miro.board.viewport.zoomTo(image);
    // await miro.board.createStickyNote({
    //   content: "I'm not overlaping any existing widgets",
    //   x: position.x,
    //   y: position.y,
    //   width: position.width,
    // });
  };

  const listItems = dropdownOptions.map((option) => (
    <li key={option}>{option}</li>
  ));

  return (
    <div className="grid">
      <p>The following options are available: </p>
      <ul>{listItems}</ul>
    </div>
  );
}
