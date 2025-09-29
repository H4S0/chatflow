'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Bot, Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { handleGeneratePost } from '@/app/actions/gemini';
import { UseFormReturn } from 'react-hook-form';
import { SocialMediaPostSchema } from '../cards/social-media-card';
import z from 'zod';

type FormValues = z.infer<typeof SocialMediaPostSchema>;

const AskAiModal = ({ form }: { form: UseFormReturn<FormValues> }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const onGenerate = async () => {
    if (!prompt.trim()) {
      setResponse('⚠️ Please enter a prompt before generating.');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const result = await handleGeneratePost(prompt);

      if (!result || result.trim().length === 0) {
        console.error('Empty response from AI:', result);
        setResponse(
          '⚠️ AI returned an empty response. Try rephrasing your prompt.'
        );
        return;
      }

      setResponse(result);
    } catch (err) {
      console.error('AI generation error:', err);
      setResponse(
        '⚠️ Something went wrong while generating. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          <span>Ask AI</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Post Generator
          </DialogTitle>
          <DialogDescription>
            Hi! 👋 I’m your AI assistant for creating social media posts. Tell
            me what vibe, tone, or topic you want — I’ll suggest a post idea for
            you 🚀
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Create a funny tweet about Monday mornings ☕"
            className="resize-none"
          />

          <div className="grid grid-cols-[1fr_150] gap-2">
            {response && (
              <Button
                onClick={() => {
                  form.setValue('post', response);
                  setIsOpen(false);
                }}
              >
                Paste at post
              </Button>
            )}
            <Button onClick={onGenerate} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          {response && (
            <div className="border rounded-md p-3 bg-muted text-sm whitespace-pre-wrap">
              {response}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AskAiModal;
