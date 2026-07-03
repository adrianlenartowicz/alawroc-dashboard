'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function updateChild(childId: string, formData: FormData) {
  await requireAdmin();

  const name = ((formData.get('name') as string) ?? '').trim();
  const birthYear = Number(formData.get('birthYear'));
  const groupId = formData.get('groupId') as string;

  if (!name) throw new Error('Imię jest wymagane.');
  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > new Date().getFullYear()) {
    throw new Error('Nieprawidłowy rok urodzenia.');
  }
  if (!groupId) throw new Error('Grupa jest wymagana.');

  const child = await prisma.child.findUnique({ where: { id: childId }, select: { id: true } });
  if (!child) throw new Error('Nie znaleziono dziecka.');

  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
  if (!group) throw new Error('Nie znaleziono grupy.');

  await prisma.child.update({
    where: { id: childId },
    data: { name, birthYear, groupId },
  });

  redirect(`/admin/children/${childId}?child=updated`);
}

export async function deleteTestResult(resultId: string) {
  await requireAdmin();

  const result = await prisma.testResult.findUnique({
    where: { id: resultId },
    select: { id: true, childId: true },
  });
  if (!result) throw new Error('Nie znaleziono wyniku.');

  await prisma.testResult.delete({ where: { id: resultId } });

  redirect(`/admin/children/${result.childId}?result=deleted`);
}
