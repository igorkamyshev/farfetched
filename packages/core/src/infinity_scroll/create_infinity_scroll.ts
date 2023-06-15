import { FetchingStatus } from '@farfetched/core';
import {
	createEffect,
	createStore,
	createEvent,
	sample,
	Store
} from 'effector';
import { reshape, not, and } from 'patronum';
import { ParamsAndResult } from '../types';

export interface CreateInfinityScrollOptions<
	Params,
	Data,
	FetcherData,
	MappedData extends Data
> {
	readonly initialData: Data | MappedData;
	readonly fetcher: (params: Params) => FetcherData;
	readonly mapData: (
		options: ParamsAndResult<Params, FetcherData>
	) => MappedData;
	readonly getNextParams: (
		options: ParamsAndResult<Params, FetcherData>
	) => Params;
	readonly isEnd: (options: ParamsAndResult<Params, FetcherData>) => boolean;
	readonly concatData: ({
		data,
		mapped,
	}: {
		data: MappedData;
		mapped: MappedData;
	}) => MappedData;
}

export const createInfinityScroll = <
	Params,
	Data,
	FetcherData,
	MappedData extends Data
>(
		options: CreateInfinityScrollOptions<Params, Data, FetcherData, MappedData>
	) => {
	const { fetcher, initialData, mapData, getNextParams, isEnd, concatData, } =
		options;

	const requestFx = createEffect(fetcher);

	const $data = createStore<MappedData>(initialData as MappedData);
	const $error = createStore<any>(null);
	const dataMapped = createEvent<MappedData>();
	const dataConcatenated = createEvent<MappedData>();

	const $nextParams = createStore<Params | null>(null);
	const extractNextParams = createEvent<ParamsAndResult<Params, FetcherData>>();

	const $status = createStore<FetchingStatus>('initial');
	const { $failed, $initial, $pending, $succeeded, } = reshape({
		source: $status,
		shape: {
			$initial: (status) => status === 'initial',
			$pending: (status) => status === 'pending',
			$failed: (status) => status === 'fail',
			$succeeded: (status) => status === 'done',
		},
	});

	const $ended = createStore(false);
	const checkEnding = createEvent<ParamsAndResult<Params, FetcherData>>();

	const start = createEvent<Params>();
	const next = createEvent();

	sample({
		clock: start,
		filter: not($pending),
		target: [$data.reinit!, $nextParams.reinit, requestFx],
	});

	sample({
		clock: requestFx.done,
		target: [extractNextParams, checkEnding],
	});

	sample({
		clock: checkEnding,
		fn: isEnd,
		target: $ended,
	});

	sample({
		clock: extractNextParams,
		fn: getNextParams,
		target: $nextParams,
	});

	sample({
		clock: requestFx.done,
		fn: mapData,
		target: dataMapped,
	});

	sample({
		clock: dataMapped,
		source: $data,
		fn: (data, mapped) => concatData({ data, mapped, }),
		target: dataConcatenated,
	});

	sample({
		clock: dataConcatenated,
		target: $data,
	});

	sample({
		clock: next,
		source: $nextParams as Store<Params>,
		filter: and(not($pending), not($ended)),
		target: requestFx,
	});

	sample({
		clock: requestFx,
		fn: () => 'pending' as FetchingStatus,
		target: $status,
	});

	sample({
		clock: requestFx.fail,
		fn: () => 'fail' as FetchingStatus,
		target: $status,
	});

	sample({
		clock: requestFx.done,
		fn: () => 'done' as FetchingStatus,
		target: $status,
	});

	return {
		start,
		next,
		$data,
		$error,
		$status,
		$failed,
		$initial,
		$pending,
		$succeeded,
		$ended,
	};
};
