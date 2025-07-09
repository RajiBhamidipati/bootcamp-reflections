import { supabase, supabaseAdmin } from './supabase'
import { Reflection, BlogPost } from '@/types'
import { analyzeSentiment, extractKeywords } from './sentiment'

export class BlogGenerator {
  static async generateBlogPost(
    theme: string,
    includeQuotes: boolean = true,
    anonymize: boolean = true
  ): Promise<{ post: BlogPost; error?: string }> {
    try {
      // Fetch recent reflections for content generation
      const { data: reflections, error } = await supabaseAdmin
        .from('reflections')
        .select(`
          *,
          users (name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        return { post: {} as BlogPost, error: error.message }
      }

      // Generate blog post content
      const postContent = await this.generateContent(reflections || [], theme, includeQuotes, anonymize)
      
      // Extract anonymous quotes if requested
      const anonymousQuotes = includeQuotes ? this.extractAnonymousQuotes(reflections || []) : []
      
      // Generate tags based on content
      const tags = this.generateTags(postContent.content, reflections || [])
      
      // Create blog post
      const blogPost: BlogPost = {
        id: '',
        title: postContent.title,
        content: postContent.content,
        excerpt: postContent.excerpt,
        anonymous_quotes: anonymousQuotes,
        tags,
        published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return { post: blogPost }
    } catch (error) {
      return { post: {} as BlogPost, error: 'Failed to generate blog post' }
    }
  }

  private static async generateContent(
    reflections: any[],
    theme: string,
    includeQuotes: boolean,
    anonymize: boolean
  ) {
    // Analyze reflections for insights
    const insights = this.analyzeReflections(reflections)
    
    // Generate title based on theme and insights
    const title = this.generateTitle(theme, insights)
    
    // Generate content sections
    const sections = [
      this.generateIntroduction(theme, insights),
      this.generateMainContent(reflections, theme, insights, includeQuotes, anonymize),
      this.generateInsightsSection(insights),
      this.generateConclusion(insights)
    ]
    
    const content = sections.join('\n\n')
    const excerpt = this.generateExcerpt(content)
    
    return { title, content, excerpt }
  }

  private static analyzeReflections(reflections: any[]) {
    const totalReflections = reflections.length
    const avgMood = reflections.reduce((sum, r) => sum + (r.mood_score || 0), 0) / totalReflections
    const avgSentiment = reflections.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / totalReflections
    
    // Analyze reflection types
    const typeDistribution = reflections.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Extract common themes
    const allKeywords = reflections.flatMap(r => r.keywords || [])
    const keywordFrequency = allKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topKeywords = Object.entries(keywordFrequency)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([keyword]) => keyword)
    
    // Analyze mood trends
    const moodTrend = this.calculateTrend(reflections.map(r => r.mood_score || 0))
    
    // Find common challenges and successes
    const challenges = this.extractCommonThemes(reflections, 'challenges_faced')
    const successes = this.extractCommonThemes(reflections, 'daily_highlight')
    
    return {
      totalReflections,
      avgMood,
      avgSentiment,
      typeDistribution,
      topKeywords,
      moodTrend,
      challenges,
      successes
    }
  }

  private static generateTitle(theme: string, insights: any): string {
    const titles = {
      'weekly-recap': `Weekly Bootcamp Insights: ${insights.moodTrend > 0 ? 'Rising' : 'Steady'} Progress`,
      'mood-trends': `Mood Trends in Bootcamp: ${insights.avgMood > 7 ? 'Positive' : insights.avgMood > 4 ? 'Balanced' : 'Challenging'} Journey`,
      'learning-highlights': `Learning Highlights: Key Insights from ${insights.totalReflections} Reflections`,
      'challenges-overcome': 'Overcoming Challenges: Stories from the Bootcamp Journey',
      'success-stories': 'Success Stories: Celebrating Bootcamp Achievements',
      'community-insights': 'Community Insights: Collective Wisdom from Our Bootcamp'
    }
    
    return titles[theme as keyof typeof titles] || `Bootcamp Reflections: ${theme}`
  }

  private static generateIntroduction(theme: string, insights: any): string {
    const intros = {
      'weekly-recap': `This week, our bootcamp community shared ${insights.totalReflections} reflections, painting a picture of dedication, growth, and resilience. Here's what we learned from our collective journey.`,
      'mood-trends': `Understanding the emotional journey of learning to code is crucial for success. Our analysis of recent reflections reveals important patterns about mood and motivation during the bootcamp experience.`,
      'learning-highlights': `Every day brings new discoveries and breakthroughs. From ${insights.totalReflections} recent reflections, we've identified the most significant learning moments and insights our community has shared.`,
      'challenges-overcome': `The path to becoming a developer is filled with obstacles, but our community continues to show remarkable resilience. Here are the challenges we've faced and how we've overcome them.`,
      'success-stories': `Success comes in many forms during a bootcamp journey. From small victories to major breakthroughs, our community has achieved remarkable things this week.`,
      'community-insights': `Our bootcamp community is a treasure trove of wisdom and experience. These insights come from the collective reflections of our dedicated learners.`
    }
    
    return intros[theme as keyof typeof intros] || `Welcome to our latest bootcamp insights, based on ${insights.totalReflections} recent reflections from our community.`
  }

  private static generateMainContent(
    reflections: any[],
    theme: string,
    insights: any,
    includeQuotes: boolean,
    anonymize: boolean
  ): string {
    let content = ''
    
    // Add mood analysis
    content += `## Mood and Motivation Trends\n\n`
    content += `The average mood score this period was ${insights.avgMood.toFixed(1)}/10, indicating a ${insights.avgMood > 7 ? 'positive' : insights.avgMood > 4 ? 'balanced' : 'challenging'} overall experience. `
    content += `Sentiment analysis shows ${insights.avgSentiment > 0 ? 'positive' : 'negative'} tone in reflections.\n\n`
    
    // Add learning themes
    if (insights.topKeywords.length > 0) {
      content += `## Common Learning Themes\n\n`
      content += `The most frequently mentioned topics include: ${insights.topKeywords.slice(0, 5).join(', ')}. `
      content += `This reflects our community's focus on core development skills and collaborative learning.\n\n`
    }
    
    // Add type distribution
    content += `## Reflection Patterns\n\n`
    Object.entries(insights.typeDistribution).forEach(([type, count]) => {
      const percentage = ((count as number) / insights.totalReflections * 100).toFixed(1)
      content += `- ${type.charAt(0).toUpperCase() + type.slice(1)} reflections: ${count} (${percentage}%)\n`
    })
    content += '\n'
    
    // Add quotes if requested
    if (includeQuotes) {
      content += `## Community Voices\n\n`
      const quotes = this.extractAnonymousQuotes(reflections).slice(0, 3)
      quotes.forEach(quote => {
        content += `> "${quote}"\n>\n> — Anonymous Community Member\n\n`
      })
    }
    
    return content
  }

  private static generateInsightsSection(insights: any): string {
    let content = `## Key Insights\n\n`
    
    // Mood insights
    if (insights.avgMood > 7) {
      content += `- **Positive Momentum**: The community is maintaining high spirits with an average mood of ${insights.avgMood.toFixed(1)}/10.\n`
    } else if (insights.avgMood < 4) {
      content += `- **Support Needed**: Lower mood scores (${insights.avgMood.toFixed(1)}/10) suggest the community could benefit from additional support.\n`
    }
    
    // Trend insights
    if (insights.moodTrend > 0) {
      content += `- **Upward Trend**: Mood scores are improving over time, indicating positive progress.\n`
    } else if (insights.moodTrend < 0) {
      content += `- **Attention Required**: Declining mood trends suggest we should focus on support and encouragement.\n`
    }
    
    // Learning insights
    if (insights.topKeywords.includes('javascript') || insights.topKeywords.includes('coding')) {
      content += `- **Technical Focus**: Strong emphasis on core programming concepts and practical application.\n`
    }
    
    if (insights.topKeywords.includes('teamwork') || insights.topKeywords.includes('collaboration')) {
      content += `- **Collaborative Learning**: Community members are actively engaging in peer learning and support.\n`
    }
    
    return content
  }

  private static generateConclusion(insights: any): string {
    let conclusion = `## Looking Forward\n\n`
    
    if (insights.avgMood > 6) {
      conclusion += `Our community continues to demonstrate resilience and positive engagement. `
    } else {
      conclusion += `While we face challenges, our community's commitment to growth remains strong. `
    }
    
    conclusion += `With ${insights.totalReflections} reflections this period, we see an active and engaged learning community. `
    
    if (insights.moodTrend > 0) {
      conclusion += `The upward trend in mood and motivation suggests we're on the right path.`
    } else {
      conclusion += `Let's continue supporting each other as we navigate this learning journey together.`
    }
    
    conclusion += `\n\n*This post is generated from anonymized community reflections to provide insights while protecting individual privacy.*`
    
    return conclusion
  }

  private static generateExcerpt(content: string): string {
    const firstParagraph = content.split('\n\n')[0]
    const cleanText = firstParagraph.replace(/[#>-]/g, '').trim()
    return cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText
  }

  private static extractAnonymousQuotes(reflections: any[]): string[] {
    const quotes: string[] = []
    
    reflections.forEach(reflection => {
      const content = reflection.content
      
      // Extract meaningful quotes from different fields
      if (content.daily_highlight && content.daily_highlight.length > 50) {
        quotes.push(content.daily_highlight)
      }
      
      if (content.biggest_learning && content.biggest_learning.length > 50) {
        quotes.push(content.biggest_learning)
      }
      
      if (content.gratitude && content.gratitude.length > 30) {
        quotes.push(content.gratitude)
      }
      
      if (content.learning_progress && content.learning_progress.length > 50) {
        quotes.push(content.learning_progress)
      }
    })
    
    // Filter and clean quotes
    return quotes
      .filter(quote => quote.length > 30 && quote.length < 300)
      .map(quote => quote.trim())
      .slice(0, 10)
  }

  private static generateTags(content: string, reflections: any[]): string[] {
    const tags: string[] = []
    
    // Content-based tags
    if (content.toLowerCase().includes('mood')) tags.push('mood-tracking')
    if (content.toLowerCase().includes('learning')) tags.push('learning-journey')
    if (content.toLowerCase().includes('challenge')) tags.push('challenges')
    if (content.toLowerCase().includes('success')) tags.push('success-stories')
    if (content.toLowerCase().includes('community')) tags.push('community-insights')
    if (content.toLowerCase().includes('trend')) tags.push('data-analysis')
    
    // Reflection-based tags
    const types = [...new Set(reflections.map(r => r.type))]
    types.forEach(type => {
      if (type === 'daily') tags.push('daily-reflections')
      if (type === 'weekly') tags.push('weekly-reviews')
      if (type === 'project') tags.push('project-insights')
      if (type === 'mood') tags.push('mood-tracking')
    })
    
    // Add general tags
    tags.push('bootcamp', 'reflection-analysis', 'student-insights')
    
    return [...new Set(tags)].slice(0, 8)
  }

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    
    return secondAvg - firstAvg
  }

  private static extractCommonThemes(reflections: any[], field: string): string[] {
    const themes: string[] = []
    
    reflections.forEach(reflection => {
      const content = reflection.content[field]
      if (content && typeof content === 'string') {
        themes.push(content)
      }
    })
    
    return themes.slice(0, 5)
  }

  static async saveBlogPost(post: BlogPost): Promise<{ data?: BlogPost; error?: string }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .insert(post)
        .select()
        .single()

      if (error) {
        return { error: error.message }
      }

      return { data }
    } catch (error) {
      return { error: 'Failed to save blog post' }
    }
  }

  static async publishBlogPost(id: string): Promise<{ success?: boolean; error?: string }> {
    try {
      const { error } = await supabaseAdmin
        .from('blog_posts')
        .update({ published: true, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        return { error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { error: 'Failed to publish blog post' }
    }
  }

  static async getAllBlogPosts(): Promise<{ data?: BlogPost[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { error: error.message }
      }

      return { data: data || [] }
    } catch (error) {
      return { error: 'Failed to fetch blog posts' }
    }
  }

  static async getPublishedBlogPosts(): Promise<{ data?: BlogPost[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) {
        return { error: error.message }
      }

      return { data: data || [] }
    } catch (error) {
      return { error: 'Failed to fetch published blog posts' }
    }
  }
}