import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getAdminChildDetail, getAdminGroups } from '@/lib/queries/admin';
import { TEST_DEFINITIONS, TestType } from '@/lib/domain/tests';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import EditChildForm from './EditChildForm';
import DeleteResultButton from './DeleteResultButton';

type Props = {
  params: Promise<{ childId: string }>;
  searchParams: Promise<Record<string, string>>;
};

function testLabel(testType: string) {
  return TEST_DEFINITIONS[testType as TestType]?.label ?? testType;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function AdminChildPage({ params, searchParams }: Props) {
  await requireAdmin();

  const { childId } = await params;
  const queryParams = await searchParams;

  const [child, groups] = await Promise.all([getAdminChildDetail(childId), getAdminGroups()]);

  if (!child) {
    redirect('/admin/children');
  }

  const childUpdated = queryParams.child === 'updated';
  const resultUpdated = queryParams.result === 'updated';
  const resultDeleted = queryParams.result === 'deleted';

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{child.name}</h1>
          <p className="text-sm text-muted-foreground">
            ur. {child.birthYear} &mdash;{' '}
            {child.group.location ? `${child.group.name} (${child.group.location})` : child.group.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/children/${child.id}/dashboard`}>Zobacz postępy</Link>
        </Button>
      </div>

      {childUpdated && (
        <Alert>
          <AlertDescription>Dane dziecka zostały zapisane.</AlertDescription>
        </Alert>
      )}

      {resultUpdated && (
        <Alert>
          <AlertDescription>Wynik testu został zapisany.</AlertDescription>
        </Alert>
      )}

      {resultDeleted && (
        <Alert>
          <AlertDescription>Wynik testu został usunięty.</AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Dane dziecka</h2>
        <EditChildForm
          child={{ id: child.id, name: child.name, birthYear: child.birthYear, groupId: child.groupId }}
          groups={groups}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Wyniki testów</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/results/new">Dodaj wynik</Link>
          </Button>
        </div>

        {child.results.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nie ma jeszcze żadnych wyników.
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Wynik</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {child.results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{testLabel(result.testType)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {result.value} {result.unit}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(result.testedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/results/${result.id}/edit`}>Edytuj</Link>
                        </Button>
                        <DeleteResultButton resultId={result.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
