import prisma from '@/lib/prisma';

export type AdminGroup = { id: string; name: string; location: string | null };

export type AdminChild = {
  id: string;
  name: string;
  birthYear: number;
  group: { name: string; location: string | null };
};

export type AdminUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'PARENT';
  createdAt: Date;
  isActivated: boolean;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      sessionVersion: true,
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    isActivated: u.sessionVersion > 0,
  }));
}

export async function getAdminGroups(): Promise<AdminGroup[]> {
  return prisma.group.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, location: true },
  });
}

export type AdminChildDetail = {
  id: string;
  name: string;
  birthYear: number;
  groupId: string;
  group: { name: string; location: string | null };
  results: AdminTestResult[];
};

export type AdminTestResult = {
  id: string;
  testType: string;
  value: number;
  unit: string;
  testedAt: Date;
};

export async function getAdminChildDetail(childId: string): Promise<AdminChildDetail | null> {
  return prisma.child.findUnique({
    where: { id: childId },
    select: {
      id: true,
      name: true,
      birthYear: true,
      groupId: true,
      group: { select: { name: true, location: true } },
      results: {
        orderBy: [{ testedAt: 'desc' }, { createdAt: 'desc' }],
        select: { id: true, testType: true, value: true, unit: true, testedAt: true },
      },
    },
  });
}

export type AdminResultDetail = AdminTestResult & {
  child: { id: string; name: string };
};

export async function getAdminResult(resultId: string): Promise<AdminResultDetail | null> {
  return prisma.testResult.findUnique({
    where: { id: resultId },
    select: {
      id: true,
      testType: true,
      value: true,
      unit: true,
      testedAt: true,
      child: { select: { id: true, name: true } },
    },
  });
}

export async function getAdminChildren(): Promise<AdminChild[]> {
  return prisma.child.findMany({
    orderBy: [{ name: 'asc' }, { birthYear: 'asc' }],
    select: {
      id: true,
      name: true,
      birthYear: true,
      group: { select: { name: true, location: true } },
    },
  });
}
