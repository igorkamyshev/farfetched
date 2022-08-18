function skipPayload(e: any) {
  return null;
}

function extractValue(e: any): string {
  return e.target.value;
}

export { skipPayload, extractValue };
