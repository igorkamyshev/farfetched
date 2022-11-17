export function deprecationWarning(...msg: string[]) {
  console.error(['@farfetched/core deprecation warning', ...msg].join('\n'));
}
