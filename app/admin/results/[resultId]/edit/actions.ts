'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { TestType } from '@/lib/domain/tests';
import { parseResultValue, parseTestedAt } from '@/lib/validation/test-result';

export async function updateTestResult(resultId: string, formData: FormData) {
  await requireAdmin();

  const result = await prisma.testResult.findUnique({
    where: { id: resultId },
    select: { id: true, childId: true, testType: true },
  });
  if (!result) throw new Error('Nie znaleziono wyniku.');

  const value = parseResultValue(result.testType as TestType, formData.get('value') as string);
  const testedAt = parseTestedAt(formData.get('testedAt') as string);

  await prisma.testResult.update({
    where: { id: resultId },
    data: { value, testedAt },
  });

  redirect(`/admin/children/${result.childId}?result=updated`);
}
