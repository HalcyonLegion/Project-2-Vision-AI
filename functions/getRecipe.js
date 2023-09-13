const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const body = JSON.parse(event.body);
  const { base64data, googleLensApiKey, openaiApiKey } = body;

  // Fetch data from Google Vision API
  let visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleLensApiKey}`;
  const visionRequestBody = {
    requests: [
      {
        image: { content: base64data.split(",")[1] },
        features: [
          { type: "WEB_DETECTION", maxResults: 5 },
          { type: "LABEL_DETECTION", maxResults: 5 },
        ],
      },
    ],
  };

console.log(`Sending the following payload to Google Vision API: ${JSON.stringify(visionRequestBody)}`);
const visionResponse = await fetch(visionApiUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(visionRequestBody),
});
  
const visionData = await visionResponse.json();

console.log(`Received the following response from Google Vision API: ${JSON.stringify(visionData)}`);

const description = visionData.responses[0].labelAnnotations[0].description;

  // Fetch data from OpenAI API
  let openaiUrl = "https://api.openai.com/v1/chat/completions";
const openaiRequestBody = {
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: "You are a Recipe and Nutrition expert who finds recipes and nutritional information based on the user's input.",
    },
    { role: "user", content: `Please return a recipe based on ${description} and give me some nutritional information about the recipe.` },
  ],
};

console.log(`Sending the following payload to OpenAI API: ${JSON.stringify(openaiRequestBody)}`);
const openaiResponse = await fetch(openaiUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiApiKey}` },
  body: JSON.stringify(openaiRequestBody),
});

  const openaiData = await openaiResponse.json();
  const recipe = openaiData.choices[0].message.content;
  
  return {
    statusCode: 200,
    body: JSON.stringify({ description, recipe }),
  };
};