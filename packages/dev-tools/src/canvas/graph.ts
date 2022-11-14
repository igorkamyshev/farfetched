import * as cytoscape from 'cytoscape';

export function renderGraph({
  container,
  allIds,
  onClick,
}: {
  container: HTMLElement;
  allIds: string[];
  onClick: (id: string) => void;
}) {
  const instance = cytoscape({
    container,
    style: [
      {
        selector: 'node',
        style: {
          content: 'data(id)',
        },
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
        },
      },
    ],
    elements: [
      ...allIds.map((id) => ({ data: { id } })),
      // TODO: real connections
      {
        group: 'edges',
        data: { source: 'characterQuery', target: 'originQuery' },
      },
      {
        group: 'edges',
        data: { source: 'characterQuery', target: 'currentLocationQuery' },
      },
      {
        group: 'edges',
        data: { source: 'characterQuery', target: 'characterEpisodesQuery' },
      },
      {
        group: 'edges',
        data: { source: 'episodeQuery', target: 'charactersInEpisodeQuery' },
      },
      {
        group: 'edges',
        data: { source: 'locationQuery', target: 'residentsQuery' },
      },
    ],
    layout: {
      name: 'cose',
    },
  });

  instance.on('tap', (e) => {
    onClick(e.target.id());
  });
}
