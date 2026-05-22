import { WifiOff, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useOfflineStatus } from '@/hooks';
import { useSync } from '@/hooks';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOffline } = useOfflineStatus();
  const { pendingCount, isSyncing, flush } = useSync();

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {isOffline && (
        <Badge variant="destructive" className="gap-1">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      )}
      {pendingCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs"
          onClick={flush}
          disabled={isOffline || isSyncing}
        >
          <RefreshCw className={cn('h-3 w-3', isSyncing && 'animate-spin')} />
          {pendingCount} pending
        </Button>
      )}
    </div>
  );
}
