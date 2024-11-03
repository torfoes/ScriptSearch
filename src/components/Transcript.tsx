'use client';

import { Segment } from '@/types';

interface TranscriptProps {
    segments: Segment[];
}

export default function Transcript({ segments }: TranscriptProps) {
    return (
        <div className="mt-4">
            {segments.map((segment) => (
                <div key={segment.segmentId} className="mb-2">
                    <p className="text-sm text-muted-foreground">
                        {formatTime(segment.start)} - {formatTime(segment.start + segment.duration)}
                    </p>
                    <p>{segment.text}</p>
                </div>
            ))}
        </div>
    );
}

function formatTime(seconds: number): string {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
}
