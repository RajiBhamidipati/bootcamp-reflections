import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { jsPDF } from 'jspdf'
import * as Papa from 'papaparse'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const timeRange = searchParams.get('timeRange') || '30'
    
    // Calculate date range
    const endDate = new Date()
    let startDate = new Date()
    
    if (timeRange === 'all') {
      startDate = new Date('2020-01-01')
    } else {
      startDate = new Date(endDate.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
    }
    
    // Fetch data
    const { data: reflections, error } = await supabase
      .from('reflections')
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Format data for export
    const exportData = reflections?.map(reflection => ({
      id: reflection.id,
      user_name: (reflection as { users?: { name?: string } }).users?.name || 'Unknown',
      user_email: (reflection as { users?: { email?: string } }).users?.email || 'Unknown',
      type: reflection.type,
      title: reflection.title,
      mood_score: reflection.mood_score,
      sentiment_score: reflection.sentiment_score,
      keywords: reflection.keywords?.join(', ') || '',
      overall_mood: (reflection.content as Record<string, unknown>)?.overall_mood || '',
      energy_level: (reflection.content as Record<string, unknown>)?.energy_level || '',
      stress_level: (reflection.content as Record<string, unknown>)?.stress_level || '',
      motivation: (reflection.content as Record<string, unknown>)?.motivation || '',
      daily_highlight: (reflection.content as Record<string, unknown>)?.daily_highlight || '',
      challenges_faced: (reflection.content as Record<string, unknown>)?.challenges_faced || '',
      learning_progress: (reflection.content as Record<string, unknown>)?.learning_progress || '',
      goals_tomorrow: (reflection.content as Record<string, unknown>)?.goals_tomorrow || '',
      gratitude: (reflection.content as Record<string, unknown>)?.gratitude || '',
      created_at: reflection.created_at,
      updated_at: reflection.updated_at
    })) || []
    
    if (format === 'csv') {
      const csv = Papa.unparse(exportData)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=reflections-${new Date().toISOString().split('T')[0]}.csv`
        }
      })
    } else if (format === 'json') {
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename=reflections-${new Date().toISOString().split('T')[0]}.json`
        }
      })
    } else if (format === 'pdf') {
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(20)
      doc.text('Bootcamp Reflections Export', 20, 20)
      
      // Date range
      doc.setFontSize(12)
      doc.text(`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 20, 35)
      doc.text(`Total Records: ${exportData.length}`, 20, 45)
      
      // Summary statistics
      let y = 60
      doc.setFontSize(14)
      doc.text('Summary Statistics', 20, y)
      y += 15
      
      doc.setFontSize(10)
      const avgMood = exportData.reduce((sum, r) => sum + (r.mood_score || 0), 0) / exportData.length
      const avgSentiment = exportData.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / exportData.length
      
      doc.text(`Average Mood Score: ${avgMood.toFixed(2)}/10`, 20, y)
      y += 10
      doc.text(`Average Sentiment Score: ${avgSentiment.toFixed(2)}`, 20, y)
      y += 10
      
      // Type distribution
      const typeCount = exportData.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      doc.text('Reflection Types:', 20, y)
      y += 10
      Object.entries(typeCount).forEach(([type, count]) => {
        doc.text(`  ${type}: ${count}`, 25, y)
        y += 8
      })
      
      // Recent reflections sample
      y += 10
      doc.setFontSize(14)
      doc.text('Recent Reflections (Sample)', 20, y)
      y += 15
      
      doc.setFontSize(8)
      exportData.slice(0, 10).forEach((reflection, index) => {
        if (y > 250) {
          doc.addPage()
          y = 20
        }
        
        doc.text(`${index + 1}. ${reflection.title}`, 20, y)
        y += 8
        doc.text(`   User: ${reflection.user_name} | Type: ${reflection.type} | Mood: ${reflection.mood_score}/10`, 25, y)
        y += 8
        if (reflection.daily_highlight) {
          doc.text(`   Highlight: ${reflection.daily_highlight.substring(0, 100)}${reflection.daily_highlight.length > 100 ? '...' : ''}`, 25, y)
          y += 8
        }
        y += 5
      })
      
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=reflections-${new Date().toISOString().split('T')[0]}.pdf`
        }
      })
    }
    
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}