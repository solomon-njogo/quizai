import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'; // Configurable via env, defaults to reliable model

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 * @param {string} text - Text to estimate tokens for
 * @returns {number} - Estimated token count
 */
function estimateTokenCount(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Chunk text if it exceeds token limits
 * @param {string} text - Text to chunk
 * @param {number} maxTokens - Maximum tokens per chunk
 * @returns {Array<string>} - Array of text chunks
 */
function chunkTextIfNeeded(text, maxTokens = 100000) {
  const estimatedTokens = estimateTokenCount(text);
  
  if (estimatedTokens <= maxTokens) {
    return [text];
  }

  // Split by paragraphs first, then by sentences if needed
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokenCount(paragraph);
    
    if (paragraphTokens > maxTokens) {
      // If paragraph itself is too large, split by sentences
      const sentences = paragraph.split(/[.!?]+\s+/);
      for (const sentence of sentences) {
        const sentenceTokens = estimateTokenCount(sentence);
        if (estimateTokenCount(currentChunk) + sentenceTokens > maxTokens) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
          }
        }
        currentChunk += sentence + '. ';
      }
    } else {
      if (estimateTokenCount(currentChunk) + paragraphTokens > maxTokens) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      }
      currentChunk += paragraph + '\n\n';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Parse and validate quiz response from AI
 * @param {string} responseText - Raw response text from AI
 * @returns {Promise<{questions: Array|null, error: string|null}>}
 */
function parseQuizResponse(responseText) {
  try {
    // Try to extract JSON from the response (handle markdown code blocks)
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    // Try to find JSON array in the text
    const jsonArrayMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      jsonText = jsonArrayMatch[0];
    }

    const parsed = JSON.parse(jsonText);

    if (!Array.isArray(parsed)) {
      return {
        questions: null,
        error: 'AI response is not an array'
      };
    }

    // Validate and normalize questions
    const questions = [];
    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i];
      
      // Validate required fields
      if (!q.question || typeof q.question !== 'string') {
        return {
          questions: null,
          error: `Question ${i + 1} is missing or invalid 'question' field`
        };
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return {
          questions: null,
          error: `Question ${i + 1} must have exactly 4 options`
        };
      }

      // Validate options are strings
      if (!q.options.every(opt => typeof opt === 'string')) {
        return {
          questions: null,
          error: `Question ${i + 1} options must all be strings`
        };
      }

      // Validate correct answer index
      let correctIndex = q.correct;
      if (typeof correctIndex !== 'number') {
        // Try to parse if it's a string
        correctIndex = parseInt(correctIndex);
      }
      
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
        return {
          questions: null,
          error: `Question ${i + 1} must have 'correct' as a number between 0 and 3`
        };
      }

      if (!q.explanation || typeof q.explanation !== 'string') {
        return {
          questions: null,
          error: `Question ${i + 1} is missing or invalid 'explanation' field`
        };
      }

      questions.push({
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        correct: correctIndex,
        explanation: q.explanation.trim()
      });
    }

    // Ensure exactly 10 questions
    if (questions.length !== 10) {
      return {
        questions: null,
        error: `Expected exactly 10 questions, but got ${questions.length}`
      };
    }

    return { questions, error: null };
  } catch (error) {
    console.error('Error parsing quiz response:', error);
    return {
      questions: null,
      error: `Failed to parse AI response: ${error.message}`
    };
  }
}

/**
 * Generate quiz questions from text using OpenRouter API
 * @param {string} text - Text content to generate quiz from
 * @param {string} model - Model to use (default: openai/gpt-4o-mini)
 * @returns {Promise<{questions: Array|null, error: string|null}>}
 */
export async function generateQuiz(text, model = DEFAULT_MODEL) {
  try {
    if (!OPENROUTER_API_KEY) {
      return {
        questions: null,
        error: 'OPENROUTER_API_KEY is not configured'
      };
    }

    if (!text || text.trim().length === 0) {
      return {
        questions: null,
        error: 'Text content is required'
      };
    }

    // Chunk text if needed (reserve ~2000 tokens for prompt and response)
    const maxInputTokens = 100000; // Conservative limit
    const chunks = chunkTextIfNeeded(text, maxInputTokens);
    
    // Use first chunk if text is too large (or combine intelligently)
    const textToUse = chunks[0];

    // Create prompt for quiz generation
    const prompt = `You are an expert educational content creator. Generate exactly 10 high-quality multiple-choice quiz questions based on the following course material.

IMPORTANT REQUIREMENTS:
1. Generate EXACTLY 10 questions - no more, no less
2. Each question must be relevant to the content and test understanding
3. Questions should cover different aspects of the material
4. Each question must have exactly 4 options (A, B, C, D)
5. The correct answer index must be 0, 1, 2, or 3 (representing the position in the options array)
6. Include a clear explanation for each correct answer

OUTPUT FORMAT (JSON array only, no markdown, no extra text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Explanation of why this is the correct answer."
  },
  ...
]

Course Material:
${textToUse}

Generate the quiz questions now:`;

    // Make API request to OpenRouter
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://quizai.app',
        'X-Title': 'QuizAI Quiz Generator'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000 // Enough for 10 questions with explanations
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        questions: null,
        error: `OpenRouter API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`
      };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      return {
        questions: null,
        error: 'No response content from AI'
      };
    }

    // Parse and validate the response
    return parseQuizResponse(responseText);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return {
      questions: null,
      error: `Failed to generate quiz: ${error.message}`
    };
  }
}

