'use client';

import { useState } from 'react';
import YouTube from 'react-youtube';
import { Video, SegmentChunk } from '@/db/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Transcript from '@/components/Transcript';
import { SimilarityChart } from '@/components/SimilarityChart';

interface VideoPageProps {
    video: Video;
    segments: SegmentChunk[];
}

interface SegmentChunkWithDistance extends SegmentChunk {
    distance: number;
}

type SearchResponse =
    | { segments: SegmentChunkWithDistance[] }
    | { error: string };

export default function VideoPage({ video, segments }: VideoPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SegmentChunkWithDistance[]>([]);
    const [player, setPlayer] = useState<YT.Player | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) return;

        // Perform semantic search using embeddings
        const response = await fetch('/api/search', {
            method: 'POST',
            body: JSON.stringify({
                query: searchQuery,
                videoId: video.videoId,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data: SearchResponse = await response.json();

        if (response.ok && 'segments' in data) {
            setSearchResults(data.segments);
        } else if ('error' in data) {
            console.error('Search error:', data.error);
        } else {
            console.error('Unknown error occurred during search.');
        }

    };

    const onPlayerReady = (event: { target: YT.Player }) => {
        const playerInstance = event.target;
        setPlayer(playerInstance);
    };

    // Function to handle seeking when clicking on transcript segments
    const handleSegmentClick = (startTime: number | null) => {
        if (player && startTime !== null) {
            player.seekTo(startTime, true);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">{video.title}</h1>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="flex-1">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex">
                            <Input
                                placeholder="Search transcript..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>

                    {/* YouTube Player */}
                    <YouTube
                        videoId={video.videoId}
                        onReady={onPlayerReady}
                        opts={{
                            width: '100%',
                        }}
                        style={{ width: '100%' }}
                    />

                    {/* Similarity Chart */}
                    {searchResults.length > 0 && (
                        <SimilarityChart
                            segments={searchResults}
                            onSegmentClick={handleSegmentClick}
                        />
                    )}
                </div>

                {/* Right Column - Transcript */}
                <div className="flex-1 h-[700px] overflow-hidden">
                    <Transcript
                        segments={searchResults.length > 0 ? searchResults : segments}
                        onSegmentClick={handleSegmentClick}
                    />
                </div>
            </div>
        </div>
    );
}
