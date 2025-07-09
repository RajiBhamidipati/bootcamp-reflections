'use client'

import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { AnalyticsData } from '@/types'
import { formatDate } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface SentimentChartProps {
  data: AnalyticsData[]
  title?: string
  height?: number
}

export default function SentimentChart({ data, title = 'Sentiment Analysis', height = 400 }: SentimentChartProps) {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    if (data.length === 0) return

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const labels = sortedData.map(d => formatDate(d.date))
    
    const sentimentData = sortedData.map(d => d.sentiment_score)
    const reflectionCounts = sortedData.map(d => d.reflection_count)

    setChartData({
      labels,
      datasets: [
        {
          label: 'Sentiment Score',
          data: sentimentData,
          backgroundColor: sentimentData.map(score => {
            if (score > 0.3) return 'rgba(34, 197, 94, 0.8)'
            if (score > 0) return 'rgba(245, 158, 11, 0.8)'
            if (score > -0.3) return 'rgba(249, 115, 22, 0.8)'
            return 'rgba(239, 68, 68, 0.8)'
          }),
          borderColor: sentimentData.map(score => {
            if (score > 0.3) return 'rgb(34, 197, 94)'
            if (score > 0) return 'rgb(245, 158, 11)'
            if (score > -0.3) return 'rgb(249, 115, 22)'
            return 'rgb(239, 68, 68)'
          }),
          borderWidth: 1,
        },
      ],
    })
  }, [data])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y
            let sentiment = 'Neutral'
            if (value > 0.3) sentiment = 'Very Positive'
            else if (value > 0) sentiment = 'Positive'
            else if (value > -0.3) sentiment = 'Negative'
            else sentiment = 'Very Negative'
            
            return `${context.dataset.label}: ${value.toFixed(3)} (${sentiment})`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: -1,
        max: 1,
        ticks: {
          stepSize: 0.2,
        },
        title: {
          display: true,
          text: 'Sentiment Score (-1 to 1)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    )
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}