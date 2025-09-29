'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import { Loader } from 'lucide-react';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { getStreamConfig } from '@/app/actions/stream.actions';

interface StreamClientProviderProps {
  children: ReactNode;
}

const StreamClientProvider = ({ children }: StreamClientProviderProps) => {
  const videoClientRef = useRef<StreamVideoClient | null>(null);
  const currentUser = useQuery(api.users.viewer);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || videoClientRef.current) return;

    const setupStreamClient = async () => {
      try {
        setLoading(true);

        const config = await getStreamConfig(currentUser._id);

        const client = new StreamVideoClient({
          apiKey: config.apiKey,
          user: {
            id: config.user.id,
            name: currentUser.name || 'Anonymous',
            image: currentUser.image,
          },
          tokenProvider: async () => config.token,
        });

        videoClientRef.current = client;
      } catch (err) {
        console.error('Error setting up Stream client:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    setupStreamClient();

    return () => {
      if (videoClientRef.current) {
        videoClientRef.current.disconnectUser();
        videoClientRef.current = null;
      }
    };
  }, [currentUser]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!videoClientRef.current) return <Loader />;

  return <StreamVideo client={videoClientRef.current}>{children}</StreamVideo>;
};

export default StreamClientProvider;
