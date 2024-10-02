import { Configuration, OpenAIApi } from "openai-edge";

// Configure OpenAI API
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

// Function to generate image prompt
export async function generateImagePrompt(name: string) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // Change to GPT-3.5
      messages: [
        {
          role: "system",
          content: "You are a creative and helpful AI assistant Bitcoin maximalist capable of generating interesting thumbnail descriptions for my notes. Your output will be fed into the DALLE API to generate a thumbnail. The description should be minimalistic, web3-oriented, and flat-styled for a Bitcoin enthusiast. All your sentences should be Bitcoin and web3 related.",
        },
        {
          role: "user",
          content: `Please generate a thumbnail description for my notebook titled in web3 style "${name}"`,
        },
      ],
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Log the entire response for debugging
    console.log("Chat Completion Response:", JSON.stringify(data, null, 2));

    // Check if choices and message are present in the response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Unexpected response structure from OpenAI API");
    }

    const image_description = data.choices[0].message.content;
    return image_description as string;
  } catch (error) {
    console.error("Error generating image prompt:", error);
    throw error;
  }
}
// Function to generate an image
// Function to generate an image
export async function generateImage(image_description: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: image_description,
        n: 1,
        size: "256x256",
      }),
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Log the entire response for debugging
    console.log("Image Generation Response:", JSON.stringify(data, null, 2));

    // Check if data and url are present in the response
    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error("Unexpected response structure from OpenAI API");
    }

    const image_url = data.data[0].url;
    return image_url as string;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
