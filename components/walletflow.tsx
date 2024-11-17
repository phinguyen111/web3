"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

type WalletFlowData = {
    inflow: number[]
    outflow: number[]
    timestamps: string[]
    totalInflow: number
    totalOutflow: number
    currentBalance: number
}

export default function WalletFlow() {
    const [flowData, setFlowData] = useState<WalletFlowData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(false)

    const fetchWalletFlow = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('dashboard/api/walletFlow')
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'Failed to fetch wallet flow data')
            }

            const data = await response.json()
            if (data.error) {
                throw new Error(data.error)
            }

            setFlowData(data)
        } catch (err: any) {
            setError(err.message || 'Error fetching wallet flow data')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWalletFlow()

        let intervalId: NodeJS.Timeout | null = null
        if (autoRefresh) {
            intervalId = setInterval(fetchWalletFlow, 60000) // Refresh every minute
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [autoRefresh])

    const toggleAutoRefresh = () => {
        setAutoRefresh(prev => !prev)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={fetchWalletFlow} variant="outline">
                    Try Again
                </Button>
            </div>
        )
    }

    if (!flowData) return null

    const chartData = {
        labels: flowData.timestamps,
        datasets: [
            {
                fill: true,
                label: 'Inflow',
                data: flowData.inflow,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.4,
            },
            {
                fill: true,
                label: 'Outflow',
                data: flowData.outflow,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4,
            },
        ],
    }

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: 'Global Wallet Flow Analysis',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Amount (ETH)',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    callback: (value: number | string) => `${Number(value).toLocaleString()} ETH`,
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        size: 12
                    }
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    }

    return (
        <Card className="w-full bg-white shadow-xl h-[650px]">
            <CardHeader className='text-black'>
                <CardTitle>Wallet Flow Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="w-full h-[500px]">
                    <Line options={{ ...options, maintainAspectRatio: false }} data={chartData} />
                </div>
            </CardContent>
        </Card>
    )
}