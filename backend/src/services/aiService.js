import groq from "../config/groq.js";
import crmPrompt from "../prompts/crmPrompt.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mapCRMFields = async (batch) => {
  const prompt = `
${crmPrompt}

Convert the following batch of CRM records.

Batch Size: ${batch.length}

Records:

${JSON.stringify(batch, null, 2)}
`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // console.log(`Sending Batch (${batch.length} records) to AI...`);
      console.log("--------------------------------");
      console.log("Sending batch to Groq...");
      console.log(`Batch Size: ${batch.length}`);
      console.log("Batch Data:");
      console.log(batch);
      console.log("--------------------------------");
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        temperature: 0,

        messages: [
          {
            role: "system",
            content: crmPrompt,
          },
          {
            role: "user",
            content: `
Convert the following CRM records.

Batch Size: ${batch.length}

Records:
${JSON.stringify(batch, null, 2)}

Follow every rule in the system prompt.
Return ONLY a valid JSON array.
`,
          },
        ],
      });

      console.log("--------------------------------");
      console.log("Response received from Groq");
      console.log("--------------------------------");

      let text = completion.choices[0].message.content;

      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(text);
    } catch (error) {
      console.log(`Retry ${attempt} failed.`);

      if (attempt === 3) {
        throw error;
      }

      await delay(3000);
    }
  }
};
