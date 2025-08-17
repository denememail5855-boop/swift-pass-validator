import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, CreditCard, Loader2 } from 'lucide-react';

interface BusValidatorProps {
  className?: string;
}

interface CardData {
  pan: string;
  expiry: string;
}

type StatusType = 'idle' | 'processing' | 'success' | 'error';

export const BusValidator: React.FC<BusValidatorProps> = ({ className }) => {
  const [status, setStatus] = useState<StatusType>('idle');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [fareAmount] = useState('₼0.50');

  // Simulated FIFO command processor
  const processCommand = useCallback((command: string) => {
    console.log('Processing command:', command);

    if (command.startsWith('PAN:')) {
      const parts = command.split(';');
      const pan = parts[0].split(':')[1] || '';
      const expiry = parts[1]?.split(':')[1] || '';
      
      setCardData({ pan, expiry });
      setIsCardVisible(true);
      setStatus('processing');
      
      // Reset visibility timer
      setTimeout(() => {
        setIsCardVisible(false);
        setCardData(null);
        setStatus('idle');
      }, 5000);
      
      return;
    }

    if (command === '0') {
      setStatus('success');
      return;
    }

    if (command === '1') {
      setStatus('error');
      return;
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case '0':
          processCommand('0');
          break;
        case '1':
          processCommand('1');
          break;
        case 't':
          // Test card simulation
          processCommand('PAN:7123456;EXP:2405');
          break;
        case 'Escape':
          setIsCardVisible(false);
          setCardData(null);
          setStatus('idle');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [processCommand]);

  const formatExpiry = (expiry: string) => {
    if (expiry.length === 4) {
      return `${expiry.slice(2)}/${expiry.slice(0, 2)}`;
    }
    return expiry;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-16 h-16 animate-spin-elegant text-processing" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-success animate-success-bounce" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-error animate-success-bounce" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Prosess Emal edilir';
      case 'success':
        return 'Payment successful';
      case 'error':
        return 'Payment rejected';
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-gradient-header shadow-primary">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-center text-white">
            YERI Validator
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-lg bg-gradient-surface border-border shadow-card">
          <div className="p-12 text-center space-y-8">
            
            {/* Main Display - Fare or Card Info */}
            <div className="space-y-4">
              {isCardVisible && cardData ? (
                <div className="animate-slide-up">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <CreditCard className="w-8 h-8 text-primary" />
                    <Badge variant="secondary" className="bg-surface-elevated text-primary text-lg px-4 py-2">
                      Card
                    </Badge>
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {cardData.pan}
                  </div>
                  <div className="text-xl text-muted-foreground">
                    Expiry: {formatExpiry(cardData.expiry)}
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="text-6xl font-bold text-gradient-primary mb-4">
                    {fareAmount}
                  </div>
                  <div className="text-xl text-muted-foreground">
                    Kartınızı okutun
                  </div>
                </div>
              )}
            </div>

            {/* Status Display */}
            <div className="space-y-6">
              {status !== 'idle' && (
                <div className="animate-slide-up">
                  <div className="flex justify-center mb-4">
                    {getStatusIcon()}
                  </div>
                  
                  {status === 'processing' && (
                    <div className="flex justify-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-processing rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-processing rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-processing rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                  
                  <div className={`text-xl font-semibold ${
                    status === 'success' ? 'text-gradient-success' :
                    status === 'error' ? 'text-gradient-error' :
                    'text-processing'
                  }`}>
                    {getStatusMessage()}
                  </div>
                </div>
              )}
            </div>

            {/* Status indicator glow effect */}
            {status === 'success' && (
              <div className="absolute inset-0 rounded-lg shadow-success animate-pulse-glow -z-10"></div>
            )}
            {status === 'error' && (
              <div className="absolute inset-0 rounded-lg shadow-error animate-pulse-glow -z-10"></div>
            )}
          </div>
        </Card>
      </div>

      {/* Footer - Controls Info */}
      <div className="p-4 text-center text-sm text-muted-foreground space-y-1">
        <div>Test: Press 'T' for card • '0' success • '1' error • ESC reset</div>
      </div>
    </div>
  );
};