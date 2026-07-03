'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteTestResult } from './actions';

export default function DeleteResultButton({ resultId }: { resultId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      await deleteTestResult(resultId);
    } catch {
      setPending(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirming(true)}>
        Usuń
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="destructive" size="sm" disabled={pending} onClick={handleDelete}>
        {pending ? 'Usuwanie...' : 'Na pewno?'}
      </Button>
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => setConfirming(false)}>
        Anuluj
      </Button>
    </div>
  );
}
