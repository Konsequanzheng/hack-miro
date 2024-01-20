import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// const output = await replicate.run(
//   "cjwbw/shap-e:5957069d5c509126a73c7cb68abcddbb985aeefa4d318e7c63ec1352ce6da68c",
//   {
//     input: {
//       prompt: "...",
//     },
//   }
// );
// console.log(output);

export default async (req, res) => {
  // grab prompt from the front end
  let prompt = await req.body.prompt;

  try {
    const response = await replicate.run(
      "cjwbw/shap-e:5957069d5c509126a73c7cb68abcddbb985aeefa4d318e7c63ec1352ce6da68c",
      {
        input: {
          prompt: prompt,
        },
      }
    );
    console.log(response);
    const image_url = response[0];
    // send url to front end to display the image
    res.status(200).json({
      success: true,
      data: image_url,
    });
  } catch (error) {
    console.log(error);
    // send error to front end, so user can easily see that something went wrong
    res.status(400).json({
      success: false,
      error: "The image could not be generated",
    });
  }
};
