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
  const [text, setText] = useState("");

  var firstLoad = useRef(false);
  const dropdownOptions = Array(
    "Image Generator",
    "3D Generator",
    "Summarize",
  );
  const magicBoxCreated = useRef(false);
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  useEffect(async () => {
    window.miro.board.ui.on("icon:click", async () => {
      console.log("we are running this");
      var magicBox;
      var settingNote;
      const position = await miro.board.experimental.findEmptySpace({
        x: 0,
        y: 0,
        width: 250,
        height: 200,
      });
      magicBox = (await miro.board.get({ type: ["image"] })).find(
        (element) => element.title === "Magic Box"
      );
      settingNote = (await window.miro.board.get({
        type: ["sticky_note"],
        tags: ["Setting"],
      }))[0];
      
      if (magicBox === undefined) {
        magicBox = await miro.board.createImage({
          title: "Magic Box",
          url: "https://as1.ftcdn.net/v2/jpg/05/72/14/12/1000_F_572141234_oRsM7v29Ed0j1rYDcAhZwaO1VtBOSZaw.jpg",
          x: position.x, // Default value: horizontal center of the board
          y: position.y, // Default value: vertical center of the board
          width: 100, // Set either 'width', or 'height'
          rotation: 0.0,
        });
        console.log("new box");
      }
      window.miro.board.viewport.zoomTo(magicBox);

      if (settingNote === undefined) {
        var tag;
        try {
          tag = await miro.board.createTag({
            title: 'Setting',
            color: 'red',
          });
        } catch(exception){
          console.log(exception);
          tag = (await miro.board.get({ type : ["tag"] }))
            .find((item) => item.title === "Setting");
        }
        settingNote = await miro.board.createStickyNote({
          content: dropdownOptions[0],
          style: {
            fillColor: 'light_yellow', // Default value: light yellow
            textAlign: 'center', // Default alignment: center
            textAlignVertical: 'middle', // Default alignment: middle
          },
          x: magicBox.x + 150, // Default value: horizontal center of the board
          y: magicBox.y, // Default value: vertical center of the board
          shape: 'square',
          width: 100, // Set either 'width', or 'height'
          tagIds: [tag.id],
        });
        
      }

      if (!magicBoxCreated.current) {
        setInterval(checkIfAssetIsOverBox, 5000);
        magicBoxCreated.current = true;

        console.log("set polling");
        // console.log(currIntervalGlobal);
        // firstInterval.current = true;
      }
      console.log("what");
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
    placeAsset();
  }, [asset]);

  useEffect(() => {
    if (text === "") return;
    placeStickyNote();
  }, [text]);

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
      type: ["image", "sticky_note", "preview"],
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
            if (item.type === "sticky_note") {
              const prompt = item.content.replace(/(<([^>]+)>)/gi, "");
              console.log(prompt);
              await window.miro.board.remove(item);
              const response = await fetch("/api/summary", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: prompt }),
              });
              //get the response back from backend, which has the URL which we are looking for
              const { data: imageUrl } = await response.json();
              console.log(imageUrl.summary);
              setText(imageUrl.summary);
            }
            if (item.type === "preview") {
              const prompt = item.url;
              console.log(prompt);
              await window.miro.board.remove(item);
              const response = await fetch("/api/summary", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: prompt }),
              });
              //get the response back from backend, which has the URL which we are looking for
              const { data: imageUrl } = await response.json();
              console.log(imageUrl.summary);
              setText(imageUrl.summary);
            }
            break;
          default:
            break;
        }
      }
    }
  }

  const placeAsset = async () => {
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

  const placeStickyNote = async () => {
    const position = await miro.board.experimental.findEmptySpace({
      x: 0,
      y: 0,
      width: 500,
      height: 500,
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
    const note = await miro.board.createStickyNote({
      content: text,
      x: position.x,
      y: position.y,
      width: position.width,
    });
    await window.miro.board.viewport.zoomTo(note);
  };

  const listItems = dropdownOptions.map((option) => (
    <li key={option}>{option}</li>
  ));

  return (
    <div>
      <div>
        <h1>Welcome to the Miro Magic Box 🧙‍♂️</h1>
      </div>
      <div>
        Write something in a sticky note, drag it on the box, and see your ideas
        come to life! ✨
      </div>
      <br />
      <img src="magicBox.png" width={300} />
      <div>
        <p>
          Change the mode by editing the <i>setting</i> note
        </p>
        <p>The following options are available: </p>
        <ul>{listItems}</ul>
      </div>
    </div>
  );
}
