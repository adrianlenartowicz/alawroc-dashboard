'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TEST_DEFINITIONS, TestType } from '@/lib/domain/tests';
import { updateTestResult } from './actions';

type Result = {
  id: string;
  testType: string;
  value: number;
  testedAt: string; // yyyy-mm-dd
  childId: string;
};

export default function EditResultForm({ result }: { result: Result }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const definition = TEST_DEFINITIONS[result.testType as TestType];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await updateTestResult(result.id, new FormData(e.currentTarget));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Coś poszło nie tak.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="value">
          Wynik <span className="text-muted-foreground font-normal">({definition.unit})</span>
        </Label>
        <Input
          id="value"
          name="value"
          type="number"
          inputMode="decimal"
          step="any"
          min={definition.minValue}
          max={definition.maxValue}
          defaultValue={result.value}
          placeholder={`${definition.minValue}–${definition.maxValue} ${definition.unit}`}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="testedAt">Data testu</Label>
        <Input
          id="testedAt"
          name="testedAt"
          type="date"
          defaultValue={result.testedAt}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/admin/children/${result.childId}`}>Anuluj</Link>
        </Button>
      </div>
    </form>
  );
}
