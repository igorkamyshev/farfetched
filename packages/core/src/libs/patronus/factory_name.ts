import { createNode } from 'effector';

export function getFactoryName(): string | undefined {
  return (
    createNode({ regional: true }).family.owners[0]?.meta?.name ?? undefined
  );
}
