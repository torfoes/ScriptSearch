'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { z } from 'zod';

const youtubeLinkSchema = z
    .string()
    .url()
    .regex(
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
        'Please enter a valid YouTube link'
    );

export default function SearchForm() {
    const [youtubeLink, setYoutubeLink] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate the YouTube link using Zod
        const result = youtubeLinkSchema.safeParse(youtubeLink);

        if (!result.success) {
            setError(result.error.errors[0].message);
            setIsSubmitting(false);
            return;
        }

        setError('');
        // Proceed with your search logic here
        console.log('Searching for:', youtubeLink);

        // Simulate async operation (e.g., navigating to a search results page)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsSubmitting(false);
    };

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold">
                    Search YouTube Transcripts
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enter a YouTube video link to search its transcript
                </p>
            </div>
            <form onSubmit={handleSearch} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="youtube-link" className="sr-only">
                        YouTube Link
                    </label>
                    <Input
                        id="youtube-link"
                        name="youtube-link"
                        type="url"
                        required
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                    />
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>
                <div>
                    <Button
                        type="submit"
                        className="w-full flex justify-center items-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span>Loading...</span>
                        ) : (
                            <>
                                <Search className="h-5 w-5 mr-2" />
                                Search Transcript
                            </>
                        )}
                    </Button>
                </div>
            </form>
            <div className="text-center">
                <Button
                    variant="link"
                    onClick={() =>
                        window.open('https://example.com/scriptsearch-extension', '_blank')
                    }
                >
                    Add ScriptSearch Extension
                </Button>
            </div>
        </div>
    );
}
