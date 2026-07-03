import { z } from 'zod';
import { TEST_DEFINITIONS, TestType } from '@/lib/domain/tests';

const TEST_TYPES = Object.keys(TEST_DEFINITIONS) as TestType[];
const TEST_TYPES_TUPLE = TEST_TYPES as [TestType, ...TestType[]];

export const saveTestResultSchema = z
  .object({
    childId: z.string().cuid(),
    testType: z.enum(TEST_TYPES_TUPLE),
    value: z.coerce.number().nonnegative().max(1000),
  })
  .superRefine((data, ctx) => {
    const definition = TEST_DEFINITIONS[data.testType];
    if (!definition) return;

    if (data.value < definition.minValue || data.value > definition.maxValue) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: `Value must be between ${definition.minValue} and ${definition.maxValue} ${definition.unit}`,
      });
    }
  });

export type SaveTestResultInput = z.infer<typeof saveTestResultSchema>;

export function parseSaveTestResultInput(input: unknown) {
  return saveTestResultSchema.safeParse(input);
}

// Throwing variants with Polish messages, used by the admin server actions.

export function parseResultValue(testType: TestType, valueInput: string): number {
  const definition = TEST_DEFINITIONS[testType];
  const value = parseFloat(valueInput);

  if (isNaN(value)) throw new Error('Nieprawidłowa wartość.');
  if (value < definition.minValue || value > definition.maxValue) {
    throw new Error(`Wartość musi być między ${definition.minValue} a ${definition.maxValue} ${definition.unit}.`);
  }

  return value;
}

export function parseTestedAt(testedAtInput: string): Date {
  if (!testedAtInput) throw new Error('Data jest wymagana.');

  const testedAt = new Date(testedAtInput);
  if (isNaN(testedAt.getTime())) throw new Error('Nieprawidłowa data.');

  return testedAt;
}
