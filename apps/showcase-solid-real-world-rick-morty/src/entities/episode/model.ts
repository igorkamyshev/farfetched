import { createRoute } from 'atomic-router';

export const episodeRoute = createRoute<{ episodeId: number }>();
export const episodeListRoute = createRoute<{ page?: number }>();
