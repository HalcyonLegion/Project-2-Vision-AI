const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const body = JSON.parse(event.body);
  const { base64data, googleLensApiKey, openaiApiKey } = body;

  // Fetch data from Google Vision API
  let visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleLensApiKey}`;
  const visionResponse = await fetch(visionApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64data.split(",")[1] },
          features: [
            { type: "WEB_DETECTION", maxResults: 1 },
            { type: "LABEL_DETECTION", maxResults: 1 },
          ],
        },
      ],
    }),
  });

  const visionData = await visionResponse.json();
  const description = visionData.responses[0].webDetection.bestGuessLabels[0].label;

  // Fetch data from OpenAI API
  let openaiUrl = "https://api.openai.com/v1/chat/completions";
  const openaiResponse = await fetch(openaiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiApiKey}` },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a Recipe and Nutrition expert who finds recipes and nutritional information based on the user's input.",
        },
        { role: "user", content: `Please return a recipe based on ${description} and give me some nutritional information about the recipe.` },
      ],
    }),
  });

  const openaiData = await openaiResponse.json();
  const recipe = openaiData.choices[0].message.content;
  
  return {
    statusCode: 200,
    body: JSON.stringify({ description, recipe }),
  };
};