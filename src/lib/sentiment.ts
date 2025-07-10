import { SentimentAnalysis } from '@/types'
// @ts-expect-error
import Sentiment from 'sentiment'

const sentiment = new Sentiment()

export function analyzeSentiment(text: string): SentimentAnalysis {
  const result = sentiment.analyze(text)
  
  // Normalize score to -1 to 1 range
  const normalizedScore = Math.max(-1, Math.min(1, result.score / 10))
  
  // Calculate basic emotions based on keywords and patterns
  const emotions = calculateEmotions(text, result.tokens)
  
  return {
    score: normalizedScore,
    magnitude: Math.abs(normalizedScore),
    emotions
  }
}

function calculateEmotions(text: string, _tokens: unknown[]): SentimentAnalysis['emotions'] {
  const lowerText = text.toLowerCase()
  
  // Basic emotion keywords
  const emotionKeywords = {
    joy: ['happy', 'excited', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'love', 'enjoy', 'pleased', 'delighted'],
    sadness: ['sad', 'disappointed', 'down', 'depressed', 'upset', 'unhappy', 'miserable', 'gloomy', 'grief'],
    anger: ['angry', 'frustrated', 'annoyed', 'furious', 'mad', 'irritated', 'outraged', 'livid', 'hate'],
    fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'concerned', 'frightened', 'panic', 'stress'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'sudden', 'wow', 'incredible']
  }
  
  const emotions = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0
  }
  
  // Count emotion keywords
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    keywords.forEach(keyword => {
      const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length
      emotions[emotion as keyof typeof emotions] += count
    })
  })
  
  // Normalize emotions (0-1 scale)
  const maxCount = Math.max(...Object.values(emotions))
  if (maxCount > 0) {
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion as keyof typeof emotions] /= maxCount
    })
  }
  
  return emotions
}

export function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  // Remove common stop words
  const stopWords = new Set([
    'this', 'that', 'with', 'have', 'will', 'from', 'they', 'know',
    'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when',
    'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over',
    'such', 'take', 'than', 'them', 'well', 'were', 'what', 'your',
    'about', 'after', 'again', 'before', 'being', 'below', 'between',
    'both', 'during', 'each', 'further', 'having', 'into', 'more',
    'most', 'other', 'same', 'should', 'since', 'through', 'under',
    'until', 'while', 'would', 'could', 'there', 'their', 'these',
    'those', 'which', 'where', 'only', 'also', 'still', 'then'
  ])
  
  const filteredWords = words.filter(word => !stopWords.has(word))
  
  // Count word frequency
  const wordCount = filteredWords.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Return top 10 keywords
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

export function generateInsights(reflections: any[]): string[] {
  const insights: string[] = []
  
  if (reflections.length === 0) return insights
  
  // Analyze mood trends
  const moodScores = reflections
    .filter(r => r.content?.overall_mood)
    .map(r => r.content.overall_mood)
  
  if (moodScores.length > 0) {
    const avgMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length
    if (avgMood >= 7) {
      insights.push("Your mood has been consistently positive!")
    } else if (avgMood <= 4) {
      insights.push("Consider reaching out for support if you're feeling down.")
    }
  }
  
  // Analyze stress levels
  const stressScores = reflections
    .filter(r => r.content?.stress_level)
    .map(r => r.content.stress_level)
  
  if (stressScores.length > 0) {
    const avgStress = stressScores.reduce((sum, score) => sum + score, 0) / stressScores.length
    if (avgStress >= 7) {
      insights.push("Your stress levels seem high. Consider stress management techniques.")
    }
  }
  
  // Analyze common themes
  const allKeywords = reflections
    .flatMap(r => r.keywords || [])
    .reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const topKeywords = Object.entries(allKeywords)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([word]) => word)
  
  if (topKeywords.length > 0) {
    insights.push(`You frequently mention: ${topKeywords.join(', ')}`)
  }
  
  return insights
}