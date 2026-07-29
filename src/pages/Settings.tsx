import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Palette,
  Info,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Rocket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Theme = "light" | "dark" | "system";

const Settings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>("system");
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [nextUpdatesExpanded, setNextUpdatesExpanded] = useState(false);
  const [comingSoonExpanded, setComingSoonExpanded] = useState(false);

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Apply system theme by default
      applyTheme("system");
    }
  }, []);

  const applyTheme = (themeValue: Theme) => {
    const root = window.document.documentElement;

    if (themeValue === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", themeValue === "dark");
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    applyTheme(newTheme);
  };

  const getThemeIcon = (themeValue: Theme) => {
    switch (themeValue) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      case "system":
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pt-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>

      {/* Theme Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Theme</Label>
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {getThemeIcon(theme)}
                  <span className="capitalize">{theme}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Light
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Dark
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  System Default
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose your preferred theme or use system default
          </p>
        </div>
      </Card>

      {/* About Section */}
      <Card className="p-6 space-y-4">
        <Collapsible open={aboutExpanded} onOpenChange={setAboutExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full p-0 h-auto"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">About</h2>
              </div>
              {aboutExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-4">
            <div>
              <h3 className="font-semibold text-foreground">
                Financial Calculator
              </h3>
              <p className="text-sm text-muted-foreground">Version 1.5.1</p>
              <Badge variant="outline" className="mt-2">
                Build 12
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-foreground">
                A comprehensive all-in-one financial calculator app that helps
                you with:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Simple and Compound Interest calculations</li>
                <li>• SIP and Mutual Fund returns planning</li>
                <li>• EMI and Loan calculations with comparison</li>
                <li>• Currency conversion (13 major currencies)</li>
                <li>• Investment goal planning</li>
                <li>• Retirement and Education planning</li>
                <li>• Tax-saving investments (PPF, SSY, HRA)</li>
                <li>• FD, RD, and Lumpsum calculations</li>
              </ul>
            </div>

            <Separator />

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Going Global:</strong> We're actively working to add
                  features and modifications for users in other countries. Stay
                  tuned for international tax calculations, regional investment
                  schemes, and localized financial tools!
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Next Updates */}
      <Card className="p-6 space-y-4">
        <Collapsible
          open={nextUpdatesExpanded}
          onOpenChange={setNextUpdatesExpanded}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full p-0 h-auto"
            >
              <div className="flex items-center gap-3">
                <Rocket className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Next Updates
                </h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Coming Soon</Badge>
              </div>
              {nextUpdatesExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We are working on these exciting new tools for you:
              </p>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Capital Gains Calculator</h4>
                    <p className="text-xs text-muted-foreground">Calculate LTCG & STCG on your investments</p>
                  </div>
                </div>


              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Stay tuned for these updates in the next version!
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Coming Soon Features */}
      <Card className="p-6 space-y-4">
        <Collapsible
          open={comingSoonExpanded}
          onOpenChange={setComingSoonExpanded}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full p-0 h-auto"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Coming Soon
                </h2>
                <Badge variant="outline" className="bg-primary/10">
                  Future Updates
                </Badge>
              </div>
              {comingSoonExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  💱 Currency Features (v1.1.0)
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Live exchange rate updates via API</li>
                  <li>• More currencies (20+ major world currencies)</li>
                  <li>• Currency search and filter</li>
                  <li>• Favorite currencies feature</li>
                  <li>• Historical rate charts and trends</li>
                  <li>• Exchange rate alerts and notifications</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  📊 Advanced Calculators (v1.2.0)
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• GST Calculator for business calculations</li>
                  <li>• Income Tax Calculator with latest tax slabs</li>
                  <li>• Crypto Currency Calculator</li>
                  <li>• Stock Investment Calculator</li>
                  <li>• Real Estate Investment Calculator</li>
                  <li>• Insurance Premium Calculator</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  🌍 International Features (v2.0.0)
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>
                    • Multi-country tax calculators (US, UK, UAE, Singapore,
                    etc.)
                  </li>
                  <li>• Region-specific investment schemes and calculations</li>
                  <li>• International mortgage and loan calculators</li>
                  <li>
                    • Multi-language support (English, Hindi, Spanish, French,
                    etc.)
                  </li>
                  <li>• Country-specific financial planning tools</li>
                  <li>• Cross-border investment calculations</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  🎯 Smart Features (v2.1.0)
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Financial goal tracker with progress monitoring</li>
                  <li>• Budget planner and expense tracking</li>
                  <li>• Investment portfolio analyzer</li>
                  <li>• Personalized financial recommendations</li>
                  <li>• Comparison tools for multiple scenarios</li>
                  <li>• Export reports to PDF and Excel</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    🌏 Global Expansion Initiative
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    We're committed to making Financial Calculator useful for
                    everyone, everywhere. Our team is actively working on adding
                    features, calculators, and modifications specifically
                    designed for users in different countries around the world.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Whether you're in the USA, UK, Canada, Australia, UAE,
                    Singapore, or anywhere else, we're bringing localized
                    financial tools, tax calculators, and investment options
                    tailored to your country's regulations and requirements.
                  </p>
                  <p className="text-xs font-medium text-primary mt-2">
                    📧 Have a specific request for your country? Contact us with
                    your suggestions!
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                💡 Features are subject to change. Some features may be released
                earlier or later than planned.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Footer */}
      <div className="text-center py-6 space-y-2">
        <p className="text-xs text-muted-foreground">
          Made with ❤️ for financial planning
        </p>
        <p className="text-xs text-muted-foreground">
          © 2025 Financial Calculator. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Settings;
