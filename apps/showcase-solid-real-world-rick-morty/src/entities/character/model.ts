import { createRoute } from 'atomic-router';

export const characterRoute = createRoute<{ characterId: number }>();
export const characterListRoute = createRoute<{ page?: number }>();
