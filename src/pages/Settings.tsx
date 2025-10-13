import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Palette, Info, FileText, Moon, Sun, Monitor, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Theme = 'light' | 'dark' | 'system';

const Settings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>('system');
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [releaseNotesExpanded, setReleaseNotesExpanded] = useState(false);

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Apply system theme by default
      applyTheme('system');
    }
  }, []);

  const applyTheme = (themeValue: Theme) => {
    const root = window.document.documentElement;

    if (themeValue === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', themeValue === 'dark');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    applyTheme(newTheme);
  };

  const getThemeIcon = (themeValue: Theme) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
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
            <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">About</h2>
              </div>
              {aboutExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-4">
            <div>
              <h3 className="font-semibold text-foreground">Financial Calculator</h3>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-foreground">
                A comprehensive all-in-one financial calculator app that helps you with:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Simple and Compound Interest calculations</li>
                <li>• SIP and Mutual Fund returns planning</li>
                <li>• EMI and Loan calculations</li>
                <li>• Investment goal planning</li>
                <li>• Retirement and Education planning</li>
                <li>• Tax-saving investment calculations</li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Release Notes */}
      <Card className="p-6 space-y-4">
        <Collapsible open={releaseNotesExpanded} onOpenChange={setReleaseNotesExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Release Notes</h2>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
              {releaseNotesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">What's New</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Improved date picker with better year selection</li>
                <li>• Enhanced user interface with theme support</li>
                <li>• Added comprehensive settings page</li>
                <li>• Better state management for date inputs</li>
                <li>• Updated app icon and branding</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-foreground mb-2">Privacy Policy</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  We respect your privacy and are committed to protecting your personal information.
                  This app is designed to work completely offline and does not collect, store, or transmit any personal data.
                </p>
                <p>
                  <strong>Data Storage:</strong> All calculations are performed locally on your device.
                  Your financial data is stored only on your device and is not shared with any third parties.
                </p>
                <p>
                  <strong>No Tracking:</strong> We do not use analytics, tracking, or advertising services.
                  Your usage patterns and personal information remain completely private.
                </p>
                <p>
                  <strong>Local Storage:</strong> The app may store your calculation history locally on your device
                  for your convenience. This data is accessible only to you and can be cleared at any time.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default Settings;