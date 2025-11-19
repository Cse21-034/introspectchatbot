import { Brain, Zap, Globe, Shield, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function InfoSidebar() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered",
      description: "YOLOv8 deep learning model",
    },
    {
      icon: Zap,
      title: "Fast Results",
      description: "1-5 second diagnosis",
    },
    {
      icon: Globe,
      title: "Offline Ready",
      description: "Works in remote areas",
    },
    {
      icon: Shield,
      title: "High Accuracy",
      description: "Consistent & reliable",
    },
  ];

  return (
    <aside className="hidden lg:flex lg:w-80 bg-sidebar border-r border-sidebar-border flex-col p-6" data-testid="sidebar">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-sidebar-foreground mb-2" data-testid="text-brand-title">
          INTROSPECT
        </h1>
        <p className="text-sm text-muted-foreground" data-testid="text-tagline">
          AI-Powered Malaria Diagnostics
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">
          Key Features
        </h2>

        {features.map((feature, index) => (
          <Card key={index} className="p-4 hover-elevate" data-testid={`card-feature-${index}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-card-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-sidebar-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Accurate malaria detection</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Instant AI analysis</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Healthcare democratization</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
