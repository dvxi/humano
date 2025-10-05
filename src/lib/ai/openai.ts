/**
 * OpenAI Client
 *
 * AI-powered features:
 * - Training recommendations
 * - Questionnaire normalization
 * - Workout analysis
 * - Chat support
 */

import { logger } from '@/lib/logger';

const OPENAI_API_BASE = 'https://api.openai.com/v1';

interface OpenAIConfig {
  apiKey: string;
  model: string;
}

function getOpenAIConfig(): OpenAIConfig {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  return {
    apiKey,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Call OpenAI Chat Completion API
 */
async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json_object';
  }
) {
  const { apiKey, model } = getOpenAIConfig();

  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
        ...(options?.responseFormat === 'json_object' && {
          response_format: { type: 'json_object' },
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    logger.error({ error }, 'OpenAI API call failed');
    throw error;
  }
}

/**
 * Generate training recommendations based on user data
 */
export async function generateRecommendations(userData: {
  profile: {
    age?: number;
    sex?: string;
    weight?: number;
    height?: number;
    fitnessLevel?: string;
    goals?: string;
  };
  recentMetrics: {
    avgSteps?: number;
    avgSleep?: number;
    avgHeartRate?: number;
    avgCalories?: number;
  };
  recentWorkouts: Array<{
    type: string;
    duration: number;
    date: Date;
  }>;
}): Promise<{
  recommendations: string[];
  insights: string[];
  warnings: string[];
}> {
  const systemPrompt = `You are a professional fitness coach and health advisor. 
Analyze the user's profile, recent metrics, and workout history to provide personalized recommendations.
Focus on actionable advice, safety, and progressive overload principles.
Respond in JSON format with three arrays: recommendations, insights, and warnings.`;

  const userPrompt = `User Profile:
- Age: ${userData.profile.age || 'Not specified'}
- Sex: ${userData.profile.sex || 'Not specified'}
- Weight: ${userData.profile.weight || 'Not specified'} kg
- Height: ${userData.profile.height || 'Not specified'} cm
- Fitness Level: ${userData.profile.fitnessLevel || 'Not specified'}
- Goals: ${userData.profile.goals || 'Not specified'}

Recent Metrics (7-day average):
- Steps: ${userData.recentMetrics.avgSteps || 'No data'}
- Sleep: ${userData.recentMetrics.avgSleep || 'No data'} hours
- Heart Rate: ${userData.recentMetrics.avgHeartRate || 'No data'} bpm
- Calories: ${userData.recentMetrics.avgCalories || 'No data'} kcal

Recent Workouts:
${userData.recentWorkouts.map((w) => `- ${w.type}: ${w.duration} min on ${w.date.toDateString()}`).join('\n') || 'No recent workouts'}

Provide:
1. 3-5 specific, actionable recommendations
2. 2-3 insights about their current fitness state
3. Any warnings or concerns (if applicable)

Respond in JSON format:
{
  "recommendations": ["...", "..."],
  "insights": ["...", "..."],
  "warnings": ["..."]
}`;

  try {
    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.7,
        maxTokens: 1500,
        responseFormat: 'json_object',
      }
    );

    const result = JSON.parse(response);
    logger.info({ userId: userData.profile }, 'Generated AI recommendations');

    return {
      recommendations: result.recommendations || [],
      insights: result.insights || [],
      warnings: result.warnings || [],
    };
  } catch (error) {
    logger.error({ error }, 'Failed to generate recommendations');
    throw error;
  }
}

/**
 * Normalize questionnaire responses
 */
export async function normalizeQuestionnaire(responses: {
  goals?: string;
  experience?: string;
  preferences?: string;
  limitations?: string;
  [key: string]: string | undefined;
}): Promise<{
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  primaryGoal: string;
  secondaryGoals: string[];
  recommendations: string[];
}> {
  const systemPrompt = `You are a fitness assessment expert. 
Analyze questionnaire responses to determine fitness level, goals, and provide initial recommendations.
Respond in JSON format.`;

  const userPrompt = `Questionnaire Responses:
${Object.entries(responses)
  .map(([key, value]) => `${key}: ${value || 'Not answered'}`)
  .join('\n')}

Analyze and provide:
1. Fitness level (BEGINNER, INTERMEDIATE, or ADVANCED)
2. Primary goal (single, clear goal)
3. Secondary goals (array of 0-3 additional goals)
4. Initial recommendations (3-5 actionable items)

Respond in JSON format:
{
  "fitnessLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
  "primaryGoal": "...",
  "secondaryGoals": ["...", "..."],
  "recommendations": ["...", "..."]
}`;

  try {
    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.5,
        maxTokens: 1000,
        responseFormat: 'json_object',
      }
    );

    const result = JSON.parse(response);
    logger.info('Normalized questionnaire responses');

    return {
      fitnessLevel: result.fitnessLevel || 'BEGINNER',
      primaryGoal: result.primaryGoal || 'General fitness',
      secondaryGoals: result.secondaryGoals || [],
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    logger.error({ error }, 'Failed to normalize questionnaire');
    throw error;
  }
}

/**
 * Analyze workout and provide feedback
 */
export async function analyzeWorkout(workout: {
  type: string;
  duration: number;
  calories?: number;
  heartRate?: number;
  notes?: string;
}): Promise<{
  feedback: string;
  suggestions: string[];
  nextWorkout: string;
}> {
  const systemPrompt = `You are a fitness coach analyzing a completed workout.
Provide constructive feedback, suggestions for improvement, and recommend the next workout.
Be encouraging and specific.`;

  const userPrompt = `Workout Details:
- Type: ${workout.type}
- Duration: ${workout.duration} minutes
- Calories: ${workout.calories || 'Not tracked'} kcal
- Average Heart Rate: ${workout.heartRate || 'Not tracked'} bpm
- Notes: ${workout.notes || 'None'}

Provide:
1. Overall feedback (2-3 sentences)
2. 2-3 specific suggestions for improvement
3. Recommendation for next workout

Respond in JSON format:
{
  "feedback": "...",
  "suggestions": ["...", "..."],
  "nextWorkout": "..."
}`;

  try {
    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.7,
        maxTokens: 800,
        responseFormat: 'json_object',
      }
    );

    const result = JSON.parse(response);
    logger.info({ workoutType: workout.type }, 'Analyzed workout');

    return {
      feedback: result.feedback || 'Great job!',
      suggestions: result.suggestions || [],
      nextWorkout: result.nextWorkout || 'Keep up the good work!',
    };
  } catch (error) {
    logger.error({ error }, 'Failed to analyze workout');
    throw error;
  }
}
