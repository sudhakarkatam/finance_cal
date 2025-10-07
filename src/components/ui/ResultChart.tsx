import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultChartProps {
  principal: number;
  returns: number;
  principalLabel?: string;
  returnsLabel?: string;
}

const ResultChart = ({ 
  principal, 
  returns,
  principalLabel = 'Principal amount',
  returnsLabel = 'Total interest' 
}: ResultChartProps) => {
  const data = [
    { name: principalLabel, value: principal },
    { name: returnsLabel, value: returns },
  ];

  const COLORS = ['hsl(var(--chart-secondary))', 'hsl(var(--chart-primary))'];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
          <span className="text-xs text-muted-foreground">{principalLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
          <span className="text-xs text-muted-foreground">{returnsLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default ResultChart;
