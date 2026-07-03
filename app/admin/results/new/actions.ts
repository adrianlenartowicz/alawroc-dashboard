'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { TEST_DEFINITIONS, TestType } from '@/lib/domain/tests';
import { parseResultValue, parseTestedAt } from '@/lib/validation/test-result';

export async function createTestResult(formData: FormData) {
  await requireAdmin();

  const childId = formData.get('childId') as string;
  const testType = formData.get('testType') as string;
  const valueInput = formData.get('value') as string;
  const testedAtInput = formData.get('testedAt') as string;

  if (!childId) throw new Error('Dziecko jest wymagane.');
  if (!testType || !(testType in TEST_DEFINITIONS)) throw new Error('Nieprawidłowy typ testu.');

  const definition = TEST_DEFINITIONS[testType as TestType];
  const value = parseResultValue(testType as TestType, valueInput);
  const testedAt = parseTestedAt(testedAtInput);

  const child = await prisma.child.findUnique({ where: { id: childId }, select: { id: true } });
  if (!child) throw new Error('Nie znaleziono dziecka.');

  await prisma.testResult.create({
    data: { childId, testType, value, unit: definition.unit, testedAt },
  });

  redirect('/admin?result=created');
}
