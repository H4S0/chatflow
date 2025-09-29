import { Shield, MessageCircle, Zap, Users, Video, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const FeatureSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Real-time Messaging',
      description:
        'Lightning-fast messaging with typing indicators, read receipts, and seamless synchronization across all devices.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'End-to-end encryption, compliance with industry standards, and advanced security features to keep your data safe.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Create channels, organize conversations, and collaborate with your team like never before.',
    },
    {
      icon: Video,
      title: 'Voice & Video Calls',
      description:
        'Crystal-clear voice and HD video calls with screen sharing and recording capabilities.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description:
        'Built for speed with optimized performance and minimal latency for the best user experience.',
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description:
        'Your conversations are private by default with advanced privacy controls and data protection.',
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16 scroll-reveal">
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-up animate-delay-200">
            Everything you need to communicate effectively with your team,
            friends, and community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-animation">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative p-8 bg-card/50 backdrop-blur-sm border-border/20 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg animate-scale-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>

                <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-150 group-hover:bg-primary/10 transition-all duration-500"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
