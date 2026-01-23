import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CalculatorInput from '@/components/ui/CalculatorInput';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Bike, Users, Route, RotateCcw, Info, Fan } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save } from 'lucide-react';
import SaveDialog from '@/components/SaveDialog';

interface VehicleType {
    id: string;
    name: string;
    defaultMileage: number; // km/l
    defaultWear: number; // ₹/km
    defaultDep: number; // ₹/km
    icon: any;
    defaultFuel: 'petrol' | 'diesel' | 'electric';
}

const FUEL_RATES = {
    petrol: 102,
    diesel: 90,
    cng: 85,
    electric: 10, // per unit/full charge approx
};

const VEHICLE_TYPES: VehicleType[] = [
    { id: 'bike', name: 'Bike / Scooter', defaultMileage: 45, defaultWear: 0.5, defaultDep: 0.5, icon: Bike, defaultFuel: 'petrol' },
    { id: 'hatchback', name: 'Hatchback', defaultMileage: 18, defaultWear: 3.0, defaultDep: 4.0, icon: Car, defaultFuel: 'petrol' },
    { id: 'sedan', name: 'Sedan', defaultMileage: 14, defaultWear: 4.5, defaultDep: 6.0, icon: Car, defaultFuel: 'diesel' },
    { id: 'suv', name: 'SUV', defaultMileage: 12, defaultWear: 6.0, defaultDep: 8.0, icon: Car, defaultFuel: 'diesel' },
];

const TripCostCalculator = () => {
    const { symbol, formatAmount } = useCurrency();

    // Basic Inputs
    const [vehicleId, setVehicleId] = useState<string>('hatchback');
    const [distance, setDistance] = useState(100);
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [fuelPrice, setFuelPrice] = useState(100);
    const [mileage, setMileage] = useState(18);
    const [isAcOn, setIsAcOn] = useState(false);
    const [passengers, setPassengers] = useState(1);
    const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'cng' | 'electric'>('petrol');

    // Advanced Costs
    const [tollsAndParking, setTollsAndParking] = useState(0);
    const [wearAndTear, setWearAndTear] = useState(3.0);
    const [includeWearAndTear, setIncludeWearAndTear] = useState(false);
    const [includeDepreciation, setIncludeDepreciation] = useState(false);
    const [depreciationRate, setDepreciationRate] = useState(4.0);
    const [showSave, setShowSave] = useState(false);

    // Update defaults when vehicle changes
    useEffect(() => {
        const v = VEHICLE_TYPES.find(t => t.id === vehicleId);
        if (v) {
            setMileage(v.defaultMileage);
            setWearAndTear(v.defaultWear);
            setDepreciationRate(v.defaultDep);
            setFuelType(v.defaultFuel as any);
            setFuelPrice(FUEL_RATES[v.defaultFuel]);
        }
    }, [vehicleId]);

    // Update price when fuel type changes manually
    useEffect(() => {
        setFuelPrice(FUEL_RATES[fuelType]);
    }, [fuelType]);

    const results = useMemo(() => {
        const totalDistance = isRoundTrip ? distance * 2 : distance;

        // Fuel Cost
        const effectiveMileage = isAcOn ? mileage * 0.85 : mileage;
        const fuelNeeded = totalDistance / effectiveMileage;
        const fuelCost = fuelNeeded * fuelPrice;

        // Wear & Tear
        const maintenanceCost = includeWearAndTear ? (totalDistance * wearAndTear) : 0;

        // Depreciation
        const depCost = includeDepreciation ? (totalDistance * depreciationRate) : 0;

        // Totals
        const runningCost = fuelCost + maintenanceCost + tollsAndParking;
        const totalTrueCost = runningCost + depCost;

        // Split (Cash Cost is usually what friends split: Fuel + Tolls)
        // Some generous friends might split Wear & Tear, but let's show both.
        const cashCost = fuelCost + tollsAndParking;

        return {
            totalDistance,
            fuelCost,
            maintenanceCost,
            depCost,
            runningCost,
            totalTrueCost,
            cashCost,
            fuelNeeded
        };
    }, [distance, isRoundTrip, mileage, fuelPrice, tollsAndParking, wearAndTear, includeDepreciation, depreciationRate, isAcOn]);

    const handleReset = () => {
        setVehicleId('hatchback');
        setDistance(100);
        setIsRoundTrip(false);
        setTollsAndParking(0);
        setIncludeDepreciation(false);
        setIncludeWearAndTear(false);
        setPassengers(1);
        setIsAcOn(false);
    };

    return (
        <div className="p-4 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Route className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Trip Cost Calculator</h1>
                        <p className="text-sm text-muted-foreground">Calculate specific costs & split bills</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                    <Button size="sm" onClick={() => setShowSave(true)}>
                        <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Inputs */}
                <div className="md:col-span-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Trip Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Vehicle Selection */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                {VEHICLE_TYPES.map((v) => (
                                    <div
                                        key={v.id}
                                        className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all hover:bg-muted ${vehicleId === v.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                                        onClick={() => setVehicleId(v.id)}
                                    >
                                        <v.icon className={`w-6 h-6 ${vehicleId === v.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className="text-xs font-medium">{v.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pb-2">
                                <Label>Round Trip?</Label>
                                <Switch checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
                            </div>

                            <div className="flex items-center justify-between border-b pb-4 mb-2">
                                <div className="flex items-center gap-2">
                                    <Fan className={`w-4 h-4 ${isAcOn ? 'text-blue-500 animate-spin-slow' : 'text-muted-foreground'}`} />
                                    <div className="space-y-0.5">
                                        <Label>AC On?</Label>
                                        <p className="text-xs text-muted-foreground">Reduces mileage by ~15%</p>
                                    </div>
                                </div>
                                <Switch checked={isAcOn} onCheckedChange={setIsAcOn} />
                            </div>

                            <CalculatorInput
                                label="One-way Distance (km)"
                                value={distance}
                                onChange={setDistance}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fuel Type</Label>
                                    <Select value={fuelType} onValueChange={(v: any) => setFuelType(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="petrol">Petrol (₹{FUEL_RATES.petrol})</SelectItem>
                                            <SelectItem value="diesel">Diesel (₹{FUEL_RATES.diesel})</SelectItem>
                                            <SelectItem value="cng">CNG (₹{FUEL_RATES.cng})</SelectItem>
                                            <SelectItem value="electric">Electric (₹{FUEL_RATES.electric})</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <CalculatorInput
                                    label={`Price / ${fuelType === 'electric' ? 'Unit' : 'Liter'}`}
                                    value={fuelPrice}
                                    onChange={setFuelPrice}
                                    prefix={symbol}
                                />
                            </div>
                            <CalculatorInput
                                label={`Mileage (${fuelType === 'electric' ? 'km/charge' : 'km/l'})`}
                                value={mileage}
                                onChange={setMileage}
                            />

                            <CalculatorInput
                                label="Tolls, Parking & Food"
                                value={tollsAndParking}
                                onChange={setTollsAndParking}
                                prefix={symbol}
                            />

                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Include Depreciation?</Label>
                                        <p className="text-xs text-muted-foreground">Cost of owning the car per km</p>
                                    </div>
                                    <Switch checked={includeDepreciation} onCheckedChange={setIncludeDepreciation} />
                                </div>

                                {includeDepreciation && (
                                    <CalculatorInput
                                        label="Depreciation Rate (₹/km)"
                                        value={depreciationRate}
                                        onChange={setDepreciationRate}
                                        prefix={symbol}
                                    />
                                )}

                                <div className="flex items-center justify-between pt-2">
                                    <div className="space-y-0.5">
                                        <Label>Include Wear & Tear?</Label>
                                        <p className="text-xs text-muted-foreground">Tires, oil, service costs</p>
                                    </div>
                                    <Switch checked={includeWearAndTear} onCheckedChange={setIncludeWearAndTear} />
                                </div>

                                {includeWearAndTear && (
                                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                        <Label className="mb-2 block text-sm">Wear & Tear Rate (₹/km)</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <CalculatorInput
                                                    label=""
                                                    value={wearAndTear}
                                                    onChange={setWearAndTear}
                                                    prefix={symbol}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground w-1/2">
                                                Default for {VEHICLE_TYPES.find(v => v.id === vehicleId)?.name}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Results */}
                <div className="md:col-span-6 space-y-6">

                    {/* Main Cost Card */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle>Total Trip Cost</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center py-4">
                                <span className="text-4xl font-bold text-primary block">
                                    {formatAmount(Math.round(results.totalTrueCost))}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    (Fuel + Wear + Tolls {includeDepreciation ? '+ Depreciation' : ''})
                                </span>
                            </div>

                            <div className="space-y-2 text-sm border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Distance</span>
                                    <span className="font-medium">{results.totalDistance} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fuel Cost ({results.fuelNeeded.toFixed(1)} L)</span>
                                    <span className="font-medium">{formatAmount(Math.round(results.fuelCost))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Wear & Maintenance</span>
                                    <span className="font-medium">{formatAmount(Math.round(results.maintenanceCost))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tolls & Extras</span>
                                    <span className="font-medium">{formatAmount(results.cashCost - results.fuelCost)}</span>
                                </div>
                                {includeDepreciation && (
                                    <div className="flex justify-between text-yellow-600 dark:text-yellow-400">
                                        <span className="">Depreciation (Hidden Cost)</span>
                                        <span className="font-medium">{formatAmount(Math.round(results.depCost))}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Splitter Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <CardTitle>Splitting the Bill?</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Number of Travelers</Label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={passengers}
                                        onChange={(e) => setPassengers(parseInt(e.target.value))}
                                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="font-bold w-8 text-center">{passengers}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Cash Share (Fuel+Toll)</p>
                                    <p className="text-xl font-bold">{formatAmount(Math.round(results.cashCost / passengers))}</p>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-lg text-center border border-primary/20">
                                    <p className="text-xs text-muted-foreground mb-1">Fair Share (All Costs)</p>
                                    <p className="text-xl font-bold text-primary">{formatAmount(Math.round(results.runningCost / passengers))}</p>
                                </div>
                            </div>
                            <Alert className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs">
                                    "Cash Share" is what you actually pay at the pump. "Fair Share" includes the invisible wear & tear on the owner's car.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                </div>
            </div>
            <SaveDialog
                open={showSave}
                onOpenChange={setShowSave}
                calculationType="trip-cost"
                inputs={{
                    distance,
                    mileage,
                    fuelPrice,
                    tollsAndParking,
                    wearAndTear,
                    passengers,
                    isRoundTrip: isRoundTrip ? 1 : 0,
                    AC: isAcOn ? 1 : 0
                }}
                results={{
                    totalDistance: results.totalDistance,
                    fuelCost: Math.round(results.fuelCost),
                    trueCost: Math.round(results.totalTrueCost),
                    sharePerPerson: Math.round(results.runningCost / passengers)
                }}
            />
        </div>
    );
};

export default TripCostCalculator;
