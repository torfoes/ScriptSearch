'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import {
    ChartContainer,
    ChartTooltipContent,
    ChartConfig
} from '@/components/ui/chart';
import { useRouter } from 'next/navigation';
import { Segment } from '@/types';
import { formatTime } from '@/lib/utils';

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "#2563eb",
    },
    mobile: {
        label: "Mobile",
        color: "#60a5fa",
    },
} satisfies ChartConfig;

interface SimilarityChartProps {
    segments: Segment[];
    videoId: string;
}

export function SimilarityChart({ segments, videoId }: SimilarityChartProps) {
    const router = useRouter();

    // Prepare the data for the chart, including only every 25th segment
    const chartData = segments.map((segment) => ({
        startTime: segment.start,
        similarityScore: segment.distance,
        segmentId: segment.segmentId,
    }));


    // Handle bar click
    const handleBarClick = (data: any) => {
        const { startTime } = data;
        router.push(`/video/${videoId}?t=${Math.floor(startTime)}`);
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
