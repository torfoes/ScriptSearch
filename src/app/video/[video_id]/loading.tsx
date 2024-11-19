// /app/video/[video_id]/loading.jsx

import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="container mx-auto py-8">
            {/* Skeleton for the title */}
            <Skeleton className="h-8 w-1/2 mb-6" />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="flex-1">
                    {/* Skeleton for Search Bar */}
                    <div className="mb-4 flex space-x-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-24" />
                    </div>

                    {/* Skeleton for YouTube Player */}
                    <Skeleton className="w-full h-64" />

                    {/* Skeleton for Similarity Chart */}
                    <div className="mt-4">
                        <Skeleton className="w-full h-32" />
                    </div>
                </div>

                {/* Right Column - Transcript */}
                <div className="flex-1 h-[700px] overflow-hidden">
                    {/* Skeleton for Transcript */}
                    <div className="space-y-4">
                        {[...Array(15)].map((_, index) => (
                            <Skeleton key={index} className="h-6 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
