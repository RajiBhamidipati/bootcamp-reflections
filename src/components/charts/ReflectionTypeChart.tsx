'use client'

import { useEffect, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Reflection } from '@/types'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ReflectionTypeChartProps {
  data: Reflection[]
  title?: string
  height?: number
}

interface DoughnutChartData {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

export default function ReflectionTypeChart({ data, title = 'Reflection Types', height = 400 }: ReflectionTypeChartProps) {
  const [chartData, setChartData] = useState<DoughnutChartData | null>(null)

  useEffect(() => {
    if (data.length === 0) return

    const typeCounts = data.reduce((acc, reflection) => {
      acc[reflection.type] = (acc[reflection.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const labels = Object.keys(typeCounts)
    const counts = Object.values(typeCounts)

    const colors = [
      'rgba(239, 68, 68, 0.8)',   // Red for daily
      'rgba(59, 130, 246, 0.8)',  // Blue for weekly
      'rgba(34, 197, 94, 0.8)',   // Green for project
      'rgba(245, 158, 11, 0.8)',  // Yellow for mood
    ]

    const borderColors = [
      'rgb(239, 68, 68)',
      'rgb(59, 130, 246)',
      'rgb(34, 197, 94)',
      'rgb(245, 158, 11)',
    ]

    setChartData({
      labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: borderColors.slice(0, labels.length),
          borderWidth: 2,
        },
      ],
    })
  }, [data])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: { dataset: { data: number[] }; parsed: number; label: string }) {
            const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      }
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
      <Doughnut data={chartData} options={options} />
    </div>
  )
}