import React from 'react';
import { ServerType } from '../sidebar/server-sidebar';
import { Card, CardContent, CardHeader } from '../ui/card';
import z from 'zod';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import LoadingSkeleton from '../additional/loading-skeleton';
import PostCard from './post-card';
import CreatePostForm from '../forms/create-post-form';

export const SocialMediaPostSchema = z.object({
  post: z.string().max(256),
  image: z.string().optional(),
});

const SocialMediaCard = ({ selected }: { selected: ServerType }) => {
  const posts = useQuery(api.server.social_media.getPosts, {
    serverId: selected._id,
  });

  return (
    <Card className="w-full h-[calc(100vh-6.6rem)] bg-transparent flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <CardHeader>
          <CreatePostForm serverId={selected._id} />
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            {posts === undefined ? (
              <LoadingSkeleton />
            ) : posts.length ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <p className="text-muted-foreground text-center mt-4">
                <span className="text-primary">No posts yet</span> - start first
                by creating post
              </p>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default SocialMediaCard;
