import React from 'react';
import { Badge } from '../ui/badge';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';
import HeroImage from '../../app/assets/hero-red-BXuqmuOe.jpg';

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-5 overflow-hidden relative">
      <div className="absolute bg-primary/20 w-20 h-20 rounded-full left-3 top-20 animate-bounce blur-sm" />
      <div className="absolute bg-primary/20 w-20 h-20 rounded-full right-3 top-70 animate-bounce blur-sm" />

      <Badge variant="outline" className="p-2 rounded-full mt-10">
        <Zap className="w-5 h-5 mr-2 animate-bounce text-primary" />
        Join users around the world
      </Badge>

      <div className="flex flex-col items-center justify-center text-center gap-3">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight">
          <span className="block">The Future of</span>
          <span className="bg-gradient-primary bg-clip-text block text-transparent gradient-slide animate-dely-200">
            Team Communication
          </span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl max-w-4xl text-muted-foreground leading-tight">
          Experience seamless collaboration with AI-powered messaging,
          crystal-clear video calls, and intelligent workflow automation that
          adapts to your team's unique needs.
        </p>

        <div>
          <Button size="lg">
            Start today <ArrowRight />
          </Button>
        </div>

        <Image
          src={HeroImage}
          alt="hero-image"
          className="object-contain w-full h-auto rounded-xl shadow-primary/20 shadow-2xl hover:scale-[1.02] transition-transform duration-700 animate-in mt-20"
        />
      </div>
    </section>
  );
};

export default HeroSection;
