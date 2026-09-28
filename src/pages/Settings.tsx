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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Theme = "light" | "dark" | "system";

const Settings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>("system");
  const [aboutExpanded, setAboutExpanded] = useState(false);

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
              className="flex items-center justify-between w-full p-0 h-auto hover:bg-transparent"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">About</h2>
              </div>
              {aboutExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div>
              <h3 className="font-semibold text-foreground">
                Financial Calculator
              </h3>
              <p className="text-sm text-muted-foreground">Version 1.9</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                A comprehensive all-in-one financial planning companion for loans, investments, taxes, and retirement calculations with offline privacy and report sharing.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground">
          Made with ❤️ for financial planning
        </p>
      </div>
    </div>
  );
};

export default Settings;
