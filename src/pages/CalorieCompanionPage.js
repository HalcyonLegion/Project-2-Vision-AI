import React, { useState } from "react";
import axios from 'axios';
import ScrollToTopButton from "../components/ScrollToTopButton";

// Load environment variables
const googleLensApiKey = process.env.REACT_APP_GOOGLE_LENS_API_KEY;
const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;

const CalorieCompanionPage = ({ darkMode }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [calorieInfo, setCalorieInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = async (event) => {
    setIsLoading(true);
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64data = reader.result;
      setImageUrl(base64data);

      try {
        const response = await axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${googleLensApiKey}`, {
          requests: [
            {
              image: {
                content: base64data.split(',')[1],
              },
              features: [
                {
                  type: 'WEB_DETECTION',
                  maxResults: 5,
                },
                {
                  type: 'LABEL_DETECTION',
                  maxResults: 5,
                },
              ],
            },
          ],
        });

        const data = response.data;
        const description = data.responses[0].webDetection.bestGuessLabels[0].label;
        getCalorieInfo(description);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    reader.readAsDataURL(file);
  };

  const getCalorieInfo = async (description) => {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a Calorie Companion Expert who provides nutritional information based on food descriptions.',
          },
          {
            role: 'user',
            content: `Please provide nutritional information for ${description}.`,
          },
        ],
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      });

      const data = response.data;
      setCalorieInfo(data.choices[0].message.content);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={`min-h-screen py-6 flex flex-col justify-center sm:py-12 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="container" id="load">
            <div className="cube">
              <div className="sides">
                <div className="top"></div>
                <div className="right"></div>
                <div className="bottom"></div>
                <div className="left"></div>
                <div className="front"></div>
                <div className="back"></div>
              </div>
            </div>
            <div className="text">Loading</div>
          </div>
        </div>
      )}

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-r from-gray-800' : 'from-purple-400'} to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl`}></div>

        <div className="relative px-4 py-10 bg-white shadow-lg rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold mb-4">
            Calorie Companion
          </h1>

          <div>
            <p className="mb-4">
              Upload an image to get an AI-Powered estimate of the amount of calories the meal contains.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-4"
            />

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Uploaded Food Image"
                width="300"
                className="mb-4"
              />
            )}

            {calorieInfo && (
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Calorie Information:
                </h2>

                <div className="whitespace-pre-wrap break-words">{calorieInfo}</div>
              </div>
            )}
          </div>

          <div className="scroll-to-top-button-container">
            <ScrollToTopButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieCompanionPage;