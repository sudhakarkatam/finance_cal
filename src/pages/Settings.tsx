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
  FileText,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Theme = "light" | "dark" | "system";

const Settings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>("system");
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [releaseNotesExpanded, setReleaseNotesExpanded] = useState(false);
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
              <p className="text-sm text-muted-foreground">Version 1.3.6</p>
              <Badge variant="outline" className="mt-2">
                Build 6
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

      {/* Release Notes */}
      <Card className="p-6 space-y-4">
        <Collapsible
          open={releaseNotesExpanded}
          onOpenChange={setReleaseNotesExpanded}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full p-0 h-auto"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Release Notes
                </h2>
                <Badge variant="secondary">v1.3.6</Badge>
              </div>
              {releaseNotesExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Version 1.3.6 - Latest */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Version 1.3.6</h3>
                <Badge variant="default">Latest</Badge>
              </div>
              <p className="text-xs text-muted-foreground">January 2025</p>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    ✨ New Features
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>
                      💼✨ New EPF Calculator — estimate your retirement corpus
                      with salary growth projections
                    </li>
                    <li>
                      📖💡 Info dialogs added to all calculators — tap the ℹ️ icon
                      for formulas, examples, and tips
                    </li>
                    <li>
                      🔙🏠 Improved navigation — back button returns to Home
                      instead of closing the app
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Version 1.0.3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Version 1.0.3</h3>
              </div>
              <p className="text-xs text-muted-foreground">December 2025</p>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    🐛 Critical Fixes
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Fixed blank screen issue after app updates</li>
                    <li>• Resolved service worker cache conflicts</li>
                    <li>• Improved WebView cache management</li>
                    <li>• Enhanced app stability and reliability</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    🌟 Previous Updates (v1.0.2)
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>
                      • Added 5 new currencies: Singapore Dollar (SGD), New
                      Zealand Dollar (NZD), Swiss Franc (CHF), Chinese Yuan
                      (CNY), and Mexican Peso (MXN)
                    </li>
                    <li>
                      • Updated all exchange rates to November 2025 values
                    </li>
                    <li>
                      • Complete redesign of Currency Calculator with modern
                      gradient UI
                    </li>
                    <li>• Now supports 13 major international currencies</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    🔧 Android 15 Improvements
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>
                      • Fixed edge-to-edge display for modern Android devices
                    </li>
                    <li>
                      • Resolved bottom navigation overlay on devices with
                      3-button navigation
                    </li>
                    <li>
                      • Enhanced full-screen experience across all Android
                      versions (6.0 - 15+)
                    </li>
                    <li>
                      • Better support for notched devices and punch-hole
                      cameras
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    🎨 UI/UX Enhancements
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>
                      • Refreshed Currency Calculator with cleaner, more
                      intuitive layout
                    </li>
                    <li>
                      • Improved currency selection with better visual hierarchy
                    </li>
                    <li>
                      • Enhanced responsive design for tablets and large screens
                    </li>
                    <li>
                      • Smoother animations and transitions throughout the app
                    </li>
                    <li>
                      • Fixed content scrolling to prevent bottom tab overlay
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    🐛 Bug Fixes
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>
                      • Fixed navigation bar covering bottom tabs on some
                      devices
                    </li>
                    <li>
                      • Resolved hamburger menu appearing on calculator pages
                    </li>
                    <li>
                      • Fixed app name display to show "Financial Calculator"
                      correctly
                    </li>
                    <li>• Improved app stability and reduced memory usage</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Version 1.0.2 */}
            <div>
              <h3 className="font-semibold text-foreground">Version 1.0.2</h3>
              <p className="text-xs text-muted-foreground mb-2">
                November 2025
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Added 5 new currencies (SGD, NZD, CHF, CNY, MXN)</li>
                <li>• Updated exchange rates to November 2025</li>
                <li>• Redesigned Currency Calculator UI</li>
                <li>• Fixed edge-to-edge display issues</li>
                <li>• Improved Android 15 compatibility</li>
              </ul>
            </div>

            <Separator />

            {/* Version 1.0.1 */}
            <div>
              <h3 className="font-semibold text-foreground">Version 1.0.1</h3>
              <p className="text-xs text-muted-foreground mb-2">October 2025</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Performance improvements and bug fixes</li>
                <li>• Enhanced calculation accuracy</li>
                <li>• Improved app stability</li>
              </ul>
            </div>

            <Separator />

            {/* Version 1.0.0 */}
            <div>
              <h3 className="font-semibold text-foreground">Version 1.0.0</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Initial Release
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Comprehensive financial calculator suite</li>
                <li>• Theme support (Light, Dark, System)</li>
                <li>• Calculation history and save feature</li>
                <li>• Offline functionality</li>
                <li>• Material Design interface</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Privacy Policy
              </h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  We respect your privacy and are committed to protecting your
                  personal information. This app is designed to work completely
                  offline and does not collect, store, or transmit any personal
                  data.
                </p>
                <p>
                  <strong>Data Storage:</strong> All calculations are performed
                  locally on your device. Your financial data is stored only on
                  your device and is not shared with any third parties.
                </p>
                <p>
                  <strong>No Tracking:</strong> We do not use analytics,
                  tracking, or advertising services. Your usage patterns and
                  personal information remain completely private.
                </p>
                <p>
                  <strong>Local Storage:</strong> The app may store your
                  calculation history locally on your device for your
                  convenience. This data is accessible only to you and can be
                  cleared at any time.
                </p>
              </div>
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
