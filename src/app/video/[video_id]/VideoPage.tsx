'use client';

import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Video, Segment } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Transcript from '@/components/Transcript';
import { SimilarityChart } from '@/components/SimilarityChart';
import { useSearchParams } from 'next/navigation';

interface VideoPageProps {
    video: Video;
    segments: Segment[];
}

export default function VideoPage({ video, segments }: VideoPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Segment[]>([]);
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);
    const searchParams = useSearchParams();

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

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            setSearchResults(data.segments);
            setQueryEmbedding(data.queryEmbedding);
        } else {
            console.error('Search error:', data.error);
        }
    };

    const onPlayerReady = (event: any) => {
        const playerInstance: YouTubePlayer = event.target;
        setPlayer(playerInstance);

        // Seek to the time specified in the URL query parameter 't' if it exists
        const time = searchParams.get('t');
        if (time) {
            playerInstance.seekTo(parseInt(time), true);
        }
    };

    // Function to handle seeking when clicking on transcript segments
    const handleSegmentClick = (startTime: number) => {
        if (player) {
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
                        <div className="mt-4">
                            <SimilarityChart
                                segments={searchResults}
                                videoId={video.videoId}
                            />
                        </div>
                    )}
                </div>

                {/* Right Column - Transcript */}
                <div className="flex-1">
                    <Transcript
                        segments={searchResults.length > 0 ? searchResults : segments}
                        onSegmentClick={handleSegmentClick}
                    />
                </div>
            </div>
        </div>
    );
}
