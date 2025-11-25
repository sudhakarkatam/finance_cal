import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useCurrencyContext, CURRENCIES, CurrencyCode } from '@/context/CurrencyContext';

export const SettingsDialog = () => {
    const { currency, setCurrency } = useCurrencyContext();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Settings">
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Preferred Currency</Label>
                        <Select value={currency.code} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(CURRENCIES).map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                        {c.symbol} - {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            This will update the display format across the app (SIP, EMI, etc.).
                            <br />
                            <strong>Note:</strong> Income Tax calculations will always remain in INR (₹) as per Indian Tax Laws.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
