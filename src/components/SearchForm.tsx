'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from '@/components/ui/form';
import { Search } from 'lucide-react';

const formSchema = z.object({
    youtubeLink: z
        .string()
        .min(1, { message: 'Please enter a YouTube link' })
        .url({ message: 'Please enter a valid URL' })
        .regex(
            /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]{11})(.*)?$/,
            { message: 'Please enter a valid YouTube video link' }
        ),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function SearchForm() {
    const router = useRouter();

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            youtubeLink: '',
        },
    });

    function onSubmit(values: FormSchemaType) {
        const youtubeLink = values.youtubeLink;

        // Extract video ID from YouTube link
        const match = youtubeLink.match(
            /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]{11})/
        );
        const videoId = match ? match[1] : null;

        if (videoId) {
            // Redirect to /video/[video_id]
            router.push(`/video/${videoId}`);
        } else {
            // Handle invalid video ID
            form.setError('youtubeLink', {
                type: 'manual',
                message: 'Unable to extract video ID from the provided link',
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="youtubeLink"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>YouTube Link</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter a YouTube video link to search its transcript.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full flex justify-center items-center"
                >
                    <Search className="h-5 w-5 mr-2" />
                    Search Transcript
                </Button>
            </form>
        </Form>
    );
}
