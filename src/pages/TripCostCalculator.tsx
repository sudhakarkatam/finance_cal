import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CalculatorInput from '@/components/ui/CalculatorInput';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Bike, Users, Route, RotateCcw, Info, Fan, MapPin } from 'lucide-react';
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

// --- HYDERABAD HUB (Telangana/AP) ---
// --- HYDERABAD HUB (Telangana/AP) ---
const CITY_CONNECTIONS = [
    { from: 'Hyderabad', to: 'Tirupati (Balaji)', distance: 555, toll: 950 },
    { from: 'Hyderabad', to: 'Srisailam', distance: 213, toll: 200 },
    { from: 'Hyderabad', to: 'Vijayawada', distance: 275, toll: 460 },
    { from: 'Hyderabad', to: 'Vizag (Visakhapatnam)', distance: 620, toll: 1100 },
    { from: 'Hyderabad', to: 'Warangal', distance: 145, toll: 180 },
    { from: 'Hyderabad', to: 'Bangalore', distance: 569, toll: 980 },
    { from: 'Hyderabad', to: 'Mumbai', distance: 710, toll: 1250 },
    { from: 'Hyderabad', to: 'Hampi', distance: 372, toll: 450 },
    { from: 'Hyderabad', to: 'Goa', distance: 660, toll: 900 },

    // --- BANGALORE HUB (Karnataka) ---
    { from: 'Bangalore', to: 'Coorg', distance: 265, toll: 350 },
    { from: 'Bangalore', to: 'Ooty', distance: 271, toll: 380 },
    { from: 'Bangalore', to: 'Mysore', distance: 145, toll: 160 },
    { from: 'Bangalore', to: 'Chikmagalur', distance: 240, toll: 280 },
    { from: 'Bangalore', to: 'Wayanad', distance: 277, toll: 320 },
    { from: 'Bangalore', to: 'Goa', distance: 560, toll: 850 },
    { from: 'Bangalore', to: 'Pondicherry', distance: 310, toll: 550 },
    { from: 'Bangalore', to: 'Tirupati (Balaji)', distance: 250, toll: 350 },
    { from: 'Bangalore', to: 'Chennai', distance: 346, toll: 520 },

    // --- MUMBAI / PUNE HUB (Maharashtra) ---
    { from: 'Mumbai', to: 'Goa', distance: 590, toll: 950 },
    { from: 'Mumbai', to: 'Pune', distance: 148, toll: 320 }, // Expressway
    { from: 'Mumbai', to: 'Lonavala', distance: 83, toll: 250 },
    { from: 'Mumbai', to: 'Mahabaleshwar', distance: 260, toll: 450 },
    { from: 'Mumbai', to: 'Shirdi', distance: 240, toll: 400 },
    { from: 'Mumbai', to: 'Nashik', distance: 167, toll: 280 },
    { from: 'Mumbai', to: 'Surat', distance: 280, toll: 480 },
    { from: 'Mumbai', to: 'Ahmedabad', distance: 530, toll: 850 },
    { from: 'Pune', to: 'Mahabaleshwar', distance: 120, toll: 150 },
    { from: 'Pune', to: 'Shirdi', distance: 185, toll: 250 },
    { from: 'Pune', to: 'Goa', distance: 450, toll: 750 },

    // --- DELHI HUB (North) ---
    { from: 'Delhi', to: 'Jaipur', distance: 280, toll: 450 },
    { from: 'Delhi', to: 'Agra (Taj Mahal)', distance: 233, toll: 480 }, // Yamuna Expressway
    { from: 'Delhi', to: 'Chandigarh', distance: 245, toll: 380 },
    { from: 'Delhi', to: 'Shimla', distance: 342, toll: 550 },
    { from: 'Delhi', to: 'Rishikesh', distance: 240, toll: 350 },
    { from: 'Delhi', to: 'Haridwar', distance: 220, toll: 300 },
    { from: 'Delhi', to: 'Nainital', distance: 300, toll: 400 },
    { from: 'Delhi', to: 'Manali', distance: 538, toll: 800 },
    { from: 'Delhi', to: 'Katra (Vaishno Devi)', distance: 635, toll: 850 },
    { from: 'Delhi', to: 'Mathura/Vrindavan', distance: 183, toll: 250 },

    // --- CHENNAI HUB (Tamil Nadu) ---
    { from: 'Chennai', to: 'Pondicherry', distance: 151, toll: 180 }, // ECR
    { from: 'Chennai', to: 'Tirupati (Balaji)', distance: 133, toll: 150 },
    { from: 'Chennai', to: 'Mahabalipuram', distance: 56, toll: 60 },
    { from: 'Chennai', to: 'Kanchipuram', distance: 75, toll: 80 },
    { from: 'Madurai', to: 'Rameshwaram', distance: 175, toll: 150 },

    // --- OTHERS ---
    { from: 'Kolkata', to: 'Digha', distance: 183, toll: 250 },
    { from: 'Bhubaneswar', to: 'Puri (Jagannath)', distance: 60, toll: 60 },
    { from: 'Ahmedabad', to: 'Somnath', distance: 410, toll: 500 },
    { from: 'Ahmedabad', to: 'Dwarka', distance: 440, toll: 550 },
    { from: 'Chandigarh', to: 'Manali', distance: 305, toll: 300 },
    { from: 'Amritsar', to: 'Golden Temple', distance: 5, toll: 0 },
];

const POPULAR_ROAD_TRIPS = [
    // --- WEST INDIA ---
    { name: 'Mumbai to Goa (Dil Chahta Hai Route)', distance: 590, toll: 950, food: 1500 },
    { name: 'Mumbai to Lonavala (Weekend)', distance: 83, toll: 250, food: 500 },
    { name: 'Pune to Mahabaleshwar (Hill Station)', distance: 120, toll: 150, food: 800 },
    { name: 'Ahmedabad to Kutch (Rann Utsav)', distance: 400, toll: 600, food: 1200 },
    { name: 'Mumbai to Alibaug (Coastal)', distance: 95, toll: 0, food: 600 },

    // --- NORTH INDIA ---
    { name: 'Manali to Leh (Ultimate Adventure)', distance: 427, toll: 0, food: 2000 },
    { name: 'Delhi to Jaipur (Pink City)', distance: 280, toll: 450, food: 1000 },
    { name: 'Delhi to Agra (Yamuna Expressway)', distance: 233, toll: 480, food: 800 },
    { name: 'Chandigarh to Kasol (Hippie Trail)', distance: 250, toll: 200, food: 900 },
    { name: 'Delhi to Rishikesh (Yoga & Rafting)', distance: 240, toll: 350, food: 700 },
    { name: 'Shimla to Spiti Valley (Offbeat)', distance: 420, toll: 0, food: 1800 },
    { name: 'Golden Triangle (Delhi-Agra-Jaipur)', distance: 720, toll: 1100, food: 2500 },

    // --- SOUTH INDIA ---
    { name: 'Bangalore to Ooty (Nilgiris)', distance: 271, toll: 380, food: 1000 },
    { name: 'Bangalore to Coorg (Coffee Land)', distance: 265, toll: 350, food: 900 },
    { name: 'Chennai to Pondicherry (ECR Drive)', distance: 151, toll: 180, food: 800 },
    { name: 'Bangalore to Goa (Party Route)', distance: 560, toll: 850, food: 1500 },
    { name: 'Kochi to Munnar (Tea Gardens)', distance: 130, toll: 0, food: 600 },
    { name: 'Bangalore to Gokarna (Beaches)', distance: 485, toll: 650, food: 1200 },
    { name: 'Hyderabad to Hampi (Ruins)', distance: 372, toll: 450, food: 1100 },
    { name: 'Visakhapatnam to Araku Valley', distance: 114, toll: 0, food: 500 },
    { name: 'Mysore to Wayanad (Forest Drive)', distance: 130, toll: 200, food: 600 },
    { name: 'Madurai to Rameswaram (Pamban Bridge)', distance: 175, toll: 150, food: 700 },

    // --- EAST & NORTH EAST ---
    { name: 'Guwahati to Tawang (Buddhist Circuit)', distance: 509, toll: 0, food: 1800 },
    { name: 'Kolkata to Digha (Beach Run)', distance: 183, toll: 250, food: 800 },
    { name: 'Shillong to Cherrapunji (Rainiest Place)', distance: 54, toll: 0, food: 400 },
    { name: 'Gangtok to Nathu La Pass (Border)', distance: 56, toll: 200, food: 500 },
    { name: 'Bhubaneswar to Puri (Marine Drive)', distance: 60, toll: 60, food: 400 },
    { name: 'Siliguri to Darjeeling (Tea Estates)', distance: 62, toll: 0, food: 400 },

    // --- CENTRAL INDIA ---
    { name: 'Indore to Mandu (Fort City)', distance: 95, toll: 0, food: 500 },
    { name: 'Bhopal to Pachmarhi (Queen of Satpura)', distance: 195, toll: 200, food: 700 },
];


// Extract unique cities
const ALL_CITIES = Array.from(new Set(CITY_CONNECTIONS.flatMap(r => [r.from, r.to]))).sort();

const TripCostCalculator = () => {
    const { symbol, formatAmount } = useCurrency();

    // Basic Inputs
    const [vehicleId, setVehicleId] = useState<string>('hatchback');
    const [distance, setDistance] = useState(100);
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [startCity, setStartCity] = useState<string>('');
    const [endCity, setEndCity] = useState<string>('');
    const [fuelPrice, setFuelPrice] = useState(100);
    const [mileage, setMileage] = useState(18);
    const [isAcOn, setIsAcOn] = useState(false);
    const [passengers, setPassengers] = useState(1);
    const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'cng' | 'electric'>('petrol');

    // Advanced Costs
    const [tolls, setTolls] = useState(0); // Separated Tolls
    const [foodCost, setFoodCost] = useState(0); // Added Food Cost
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
        const runningCost = fuelCost + maintenanceCost + tolls + foodCost;
        const totalTrueCost = runningCost + depCost;

        // Split (Cash Cost is usually what friends split: Fuel + Tolls + Food)
        const cashCost = fuelCost + tolls + foodCost;

        return {
            totalDistance,
            fuelCost,
            maintenanceCost,
            depCost,
            mileage,
            runningCost,
            totalTrueCost,
            cashCost,
            fuelNeeded
        };
    }, [distance, isRoundTrip, mileage, fuelPrice, tolls, foodCost, wearAndTear, includeDepreciation, depreciationRate, isAcOn]);

    const handleReset = () => {
        setVehicleId('hatchback');
        setDistance(100);
        setIsRoundTrip(false);
        setTolls(0);
        setFoodCost(0);
        setIncludeDepreciation(false);
        setIncludeWearAndTear(false);
        setPassengers(1);
        setIsAcOn(false);
        setStartCity('');
        setEndCity('');
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



                            <div className="space-y-4 pb-4 border-b mb-4 pt-2">
                                <Label className="text-base font-semibold">✨ Smart Route Planner</Label>

                                {/* 1. Famous Road Trips */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Select a Famous Road Trip (One-Click)</Label>
                                    <Select onValueChange={(val) => {
                                        const trip = POPULAR_ROAD_TRIPS.find(t => t.name === val);
                                        if (trip) {
                                            setDistance(trip.distance);
                                            setTolls(trip.toll);
                                            // setFoodCost(trip.food || 0); // User requested manual input
                                            setIsRoundTrip(true);
                                            setStartCity(''); // Clear city selectors to avoid confusion
                                            setEndCity('');
                                        }
                                    }}>
                                        <SelectTrigger className="h-9 bg-primary/5 border-primary/20">
                                            <SelectValue placeholder="Select a popular route..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {POPULAR_ROAD_TRIPS.map((trip) => (
                                                <SelectItem key={trip.name} value={trip.name}>
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        <span>{trip.name}</span>
                                                        <span className="text-xs text-muted-foreground">(₹{trip.toll} toll)</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-muted"></div>
                                    <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">OR Custom Route</span>
                                    <div className="flex-grow border-t border-muted"></div>
                                </div>

                                {/* 2. City to City Selector */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Start City</Label>
                                        <Select value={startCity} onValueChange={(val) => {
                                            setStartCity(val);
                                            // Try to find route if end city is already selected
                                            if (endCity) {
                                                const route = CITY_CONNECTIONS.find(r =>
                                                    (r.from === val && r.to === endCity) ||
                                                    (r.from === endCity && r.to === val)
                                                );
                                                if (route) {
                                                    setDistance(route.distance);
                                                    setTolls(route.toll || 0);
                                                    setIsRoundTrip(true);
                                                }
                                            }
                                        }}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="From..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ALL_CITIES.map((city) => (
                                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Destination</Label>
                                        <Select
                                            value={endCity}
                                            // Removed 'disabled={!startCity}' to allow free selection
                                            onValueChange={(val) => {
                                                setEndCity(val);
                                                // Find distance & toll logic
                                                if (startCity) {
                                                    const route = CITY_CONNECTIONS.find(r =>
                                                        (r.from === startCity && r.to === val) ||
                                                        (r.from === val && r.to === startCity)
                                                    );
                                                    if (route) {
                                                        setDistance(route.distance);
                                                        setTolls(route.toll || 0);
                                                        setIsRoundTrip(true);
                                                    }
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="To..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Show ALL cities, allowing user to pick any destination */}
                                                {ALL_CITIES.filter(c => c !== startCity).map((city) => (
                                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center">
                                    *Tolls are estimates. Selecting a route auto-fills distance & tolls.
                                </p>
                            </div>

                            <div className="flex items-center justify-between border-b pb-4 mb-2 pt-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <Fan className={`w-4 h-4 ${isAcOn ? 'text-blue-500 animate-spin' : 'text-muted-foreground'}`} />
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

                            <div className="grid grid-cols-2 gap-4">
                                <CalculatorInput
                                    label="Tolls & Parking"
                                    value={tolls}
                                    onChange={setTolls}
                                    prefix={symbol}
                                />
                                <CalculatorInput
                                    label="Food & Dining"
                                    value={foodCost}
                                    onChange={setFoodCost}
                                    prefix={symbol}
                                />
                            </div>

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
                    tolls,
                    foodCost,
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
        </div >
    );
};

export default TripCostCalculator;
