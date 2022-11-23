// @ts-expect-error effector does not have public types of withFactory
import { withFactory as withFastoryRow } from 'effector';

type WithFactory = <R>({
  sid,
  name,
  loc,
  method,
  fn,
}: {
  sid: string;
  name?: string;
  loc?: any;
  method?: string;
  fn: () => R;
}) => R;

export const withFactory = withFastoryRow as WithFactory;
