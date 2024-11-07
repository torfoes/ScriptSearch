'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import {
    ChartContainer,
    ChartTooltipContent,
    ChartConfig,
} from '@/components/ui/chart';
import { SegmentChunk } from '@/db/schema';
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

interface SegmentChunkWithDistance extends SegmentChunk {
    distance: number;
}

interface SimilarityChartProps {
    segments: SegmentChunkWithDistance[];
    onSegmentClick?: (startTime: number | null) => void;
}

interface ChartData {
    startTime: number | null;
    similarityScore: number;
    chunkId: number;
}

export function SimilarityChart({ segments, onSegmentClick }: SimilarityChartProps) {
    // Prepare the data for the chart
    const chartData: ChartData[] = segments.map((segment) => ({
        startTime: segment.start,
        similarityScore: 1 / (1 + segment.distance),
        chunkId: segment.chunkId,
    }));

    // Handle bar click
    const handleBarClick = (data: ChartData) => {
        const { startTime } = data;
        if (onSegmentClick && startTime !== null) {
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
