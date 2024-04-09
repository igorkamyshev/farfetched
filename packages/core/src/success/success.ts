import { sample } from "effector";
import type { Before, After, MapParamsFn } from "./types";

const success = <BeforeRequest, BeforeResponse, AfterRequest = BeforeResponse>(
  before: Before<BeforeRequest, BeforeResponse>,
  after: After<AfterRequest>,
  mapParams: MapParamsFn<BeforeRequest, BeforeResponse, AfterRequest> = ({ result }) => result as never as AfterRequest
) => {
  sample({
    clock: before.finished.success,
    fn: mapParams,
    target: after.start
  });
}

export default success;
