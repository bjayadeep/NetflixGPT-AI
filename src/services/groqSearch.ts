import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getMovieRecommendations(
  query: string,
): Promise<string[]> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          'You are a movie recommendation expert. When given a search query, return ONLY a JSON array of 12 popular, well-known movie titles that best match. Prioritize movies that are famous and widely available. Use exact official movie titles. No explanation, no markdown, just the JSON array. Example: ["The Dark Knight", "Inception"]',
      },
      {
        role: "user",
        content: query,
      },
    ],
  });

  const text = completion.choices[0].message.content || "[]";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
