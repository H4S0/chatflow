import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Menu, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';

const PostSettingsDropdown = ({ postId }: { postId: Id<'social_media'> }) => {
  const deletePost = useMutation(api.server.social_media.deletePost);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Post settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            try {
              deletePost({
                postId: postId,
              });
              toast.success('Post deleted successfully');
            } catch (err) {
              if (err instanceof ConvexError) {
                toast.error(err.data);
              } else {
                toast.error('Something went wrong, please try again');
              }
            }
          }}
        >
          Delete post
          <Trash2 />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostSettingsDropdown;
