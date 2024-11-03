'use client';

import { SegmentChunk } from '@/types';
import { formatTime } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TranscriptProps {
    segments: SegmentChunk[];
    onSegmentClick?: (startTime: number) => void;
}

export default function Transcript({ segments, onSegmentClick }: TranscriptProps) {
    return (
        <ScrollArea className="h-full p-4">
            {segments.map((segment) => (
                <Card
                    key={segment.chunkId}
                    className="mb-4 cursor-pointer"
                    onClick={() => onSegmentClick?.(segment.start)}
                >
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            {formatTime(segment.start)} - {formatTime(segment.end)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{segment.text}</p>
                    </CardContent>
                </Card>
            ))}
        </ScrollArea>
    );
}
