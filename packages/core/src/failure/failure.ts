import { sample } from "effector";
import type { Before, After, MapParamsFn } from "./types";

const failure = <BeforeRequest, BeforeResponse, AfterRequest = BeforeResponse>(
  before: Before<BeforeRequest, BeforeResponse>,
  after: After<AfterRequest>,
  mapParams: MapParamsFn<BeforeRequest, BeforeResponse, AfterRequest> = ({ error }) => error as never as AfterRequest
) => {
  sample({
    clock: before.finished.failure,
    fn: mapParams,
    target: after.start
  });
}

export default failure;
