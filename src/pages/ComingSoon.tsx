import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center space-y-6 shadow-lg">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Construction className="w-16 h-16 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-3 pt-4">
          <p className="text-sm text-primary font-semibold">Coming Soon! 🚀</p>
          <p className="text-xs text-muted-foreground">
            We're working hard to bring you this feature. Stay tuned!
          </p>
        </div>

        <Button 
          onClick={() => navigate('/home')}
          className="w-full gap-2"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </Card>
    </div>
  );
};

export default ComingSoon;
