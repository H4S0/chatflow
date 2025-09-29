'use client';

import { Doc } from '@/convex/_generated/dataModel';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Heart, MessageSquareText } from 'lucide-react';
import Image from 'next/image';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import PostSettingsDropdown from '../additional/post-settings-dropdown';
import { Separator } from '../ui/separator';
import CreateCommentForm from '../forms/create-comment-form';
import LoadingSkeleton from '../additional/loading-skeleton';

export type PostWithOwner = Omit<Doc<'social_media'>, 'ownerId'> & {
  ownerId: Doc<'users'> | null;
  imageUrl: string | null | undefined;
};

const PostCard = ({ post }: { post: PostWithOwner }) => {
  const [isCommentExpanded, setIsCommnetExpanded] = useState(false);

  const likePost = useMutation(api.server.social_media.likePost);
  const currentUser = useQuery(api.users.viewer);
  const router = useRouter();
  const managePostsPermission = useQuery(api.server.roles.hasPermission, {
    serverId: post.serverId,
    permission: 'MANAGE_SOCIAL_MEDIA',
  });

  const comments = useQuery(api.server.social_media.getComments, {
    postId: post._id,
  });

  if (!currentUser?._id) {
    router.push('/login');
    return null;
  }

  const isLiked = post.likes?.includes(currentUser._id);

  const handleLike = async () => {
    try {
      await likePost({ postId: post._id });
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong, please try again later');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={post.ownerId?.image} />
              <AvatarFallback>
                {post.ownerId?.name?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{post.ownerId?.name}</CardTitle>
          </div>
          {managePostsPermission && <PostSettingsDropdown postId={post._id} />}
        </div>
      </CardHeader>

      <Separator />

      <CardContent>
        <CardDescription>{post.content}</CardDescription>
        {post.image && (
          <Image
            src={post.imageUrl!}
            alt="post-image"
            width={250}
            height={50}
          />
        )}
        <div className="flex items-center gap-5 mt-5">
          <div className="flex items-center gap-2">
            <Heart
              onClick={handleLike}
              className={cn(
                'cursor-pointer transition-colors duration-200 active:scale-125',
                isLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
              )}
            />
            {post.likes?.length || 0}
          </div>
          <div className="flex items-center gap-2">
            <MessageSquareText
              onClick={() => setIsCommnetExpanded((prev) => !prev)}
            />
            {post.comments?.length || 0}
          </div>
        </div>
      </CardContent>

      {isCommentExpanded && (
        <CardFooter className="flex flex-col items-start gap-7">
          {comments === undefined ? (
            <LoadingSkeleton />
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet</p>
          ) : (
            comments.map((item) => (
              <div key={item.content} className="space-y-1 w-full">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={item.user?.image} />
                    <AvatarFallback>
                      {item.user?.name?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{item.user?.name}</span>
                </div>
                <p className="text-sm bg-muted-foreground/10 w-full p-2 rounded-sm">
                  {item.content}
                </p>
              </div>
            ))
          )}

          <CreateCommentForm postId={post._id} />
        </CardFooter>
      )}
    </Card>
  );
};

export default PostCard;
