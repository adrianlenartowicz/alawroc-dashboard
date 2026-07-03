import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getAdminResult } from '@/lib/queries/admin';
import { TEST_DEFINITIONS, TestType } from '@/lib/domain/tests';
import EditResultForm from './EditResultForm';

type Props = {
  params: Promise<{ resultId: string }>;
};

export default async function EditResultPage({ params }: Props) {
  await requireAdmin();

  const { resultId } = await params;
  const result = await getAdminResult(resultId);

  if (!result) {
    redirect('/admin/children');
  }

  const testLabel = TEST_DEFINITIONS[result.testType as TestType]?.label ?? result.testType;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edytuj wynik testu</h1>
        <p className="text-sm text-muted-foreground">
          {result.child.name} &mdash; {testLabel}
        </p>
      </div>
      <EditResultForm
        result={{
          id: result.id,
          testType: result.testType,
          value: result.value,
          testedAt: result.testedAt.toISOString().slice(0, 10),
          childId: result.child.id,
        }}
      />
    </div>
  );
}
