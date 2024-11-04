'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import {
    ChartContainer,
    ChartTooltipContent,
    ChartConfig,
} from '@/components/ui/chart';
// Removed useRouter import
// import { useRouter } from 'next/navigation';
import { SegmentChunk } from '@/types';
import { formatTime } from '@/lib/utils';

const chartConfig = {
    desktop: {
        label: 'Desktop',
        color: '#2563eb',
    },
    mobile: {
        label: 'Mobile',
        color: '#60a5fa',
    },
} satisfies ChartConfig;

interface SimilarityChartProps {
    segments: SegmentChunk[];
    videoId: string;
    onSegmentClick?: (startTime: number) => void;
}

export function SimilarityChart({ segments, videoId, onSegmentClick }: SimilarityChartProps) {
    // Prepare the data for the chart
    const chartData = segments.map((segment) => ({
        startTime: segment.start,
        similarityScore: 1/(1 + segment.distance),
        chunkId: segment.chunkId,
    }));

    // Handle bar click
    const handleBarClick = (data: any) => {
        const { startTime } = data;
        if (onSegmentClick) {
            onSegmentClick(startTime);
        }
    };

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart
                data={chartData}
                onClick={(event) => {
                    if (
                        event &&
                        event.activePayload &&
                        event.activePayload.length > 0 &&
                        event.activePayload[0].payload
                    ) {
                        handleBarClick(event.activePayload[0].payload);
                    }
                }}
                
                margin={{
                    top: 20,
                    bottom: 10,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="startTime"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => formatTime(value)}
                    label={{ value: 'Time', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                    domain={['auto', 'auto']}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Similarity', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                    dataKey="similarityScore"
                    fill="var(--color-similarityScore)"
                    radius={4}
                />
            </BarChart>
        </ChartContainer>
    );
}
