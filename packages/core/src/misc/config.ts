class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export { InvalidConfigError };
