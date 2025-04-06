import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.AI_API_KEY!,
})


// all the fields required for the notification message to be generated
type Data = {
  name: string;
  title: string;
  deadline: string;
}

export async function openAIService(prompt:string = "Motivate me in 10 words", data:object) {
  const completion = await openai.chat.completions.create({
    model: "google/gemini-2.0-flash-thinking-exp:free",
    messages: [
      {
        "role": "user",
        "content": prompt
      }
    ]
  })
  if(completion.choices) {
    console.log(completion.choices)
    console.log(completion.choices[0].message.content)
    return completion.choices[0].message.content
  }
}


export default async function generateNotificationMessage(data:Data) {
  const completion = await openai.chat.completions.create({
    model: "google/gemini-2.0-flash-thinking-exp:free",
    messages: [
      {
        "role": "user",
        "content": `Write a short and crisp, motivational notification message for ${data.name} that is a bit sassy and sarcastic, similar to Duolingo's reminders. Remind them to complete their task titled "${data.title}" before its deadline at ${data.deadline}. Make it friendly, humorous, and encourage action. Don't share options, just one Direct and Teasing with a bit of Sarcasm. You may or may not include the name of the person. Here is todays date: ${new Date().toISOString()}, you may use this to show the days left to complete the task. Don't generate it in markdown format. The message must be in English.`,
      }
    ]
  })
  if(completion.choices) {
    // console.log(completion.choices)
    // console.log(completion.choices[0].message.content)
    return completion.choices[0].message.content
  }
}
