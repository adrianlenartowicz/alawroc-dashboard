'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AdminGroup } from '@/lib/queries/admin';
import { updateChild } from './actions';

type Child = { id: string; name: string; birthYear: number; groupId: string };

export default function EditChildForm({ child, groups }: { child: Child; groups: AdminGroup[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await updateChild(child.id, new FormData(e.currentTarget));
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
        <Label htmlFor="name">Imię i nazwisko</Label>
        <Input id="name" name="name" defaultValue={child.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthYear">Rok urodzenia</Label>
        <Input
          id="birthYear"
          name="birthYear"
          type="number"
          inputMode="numeric"
          min={1900}
          max={new Date().getFullYear()}
          defaultValue={child.birthYear}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="groupId">Grupa</Label>
        <Select name="groupId" defaultValue={child.groupId} required>
          <SelectTrigger id="groupId">
            <SelectValue placeholder="Wybierz grupę" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.location ? `${group.name} (${group.location})` : group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Zapisywanie...' : 'Zapisz zmiany'}
      </Button>
    </form>
  );
}
