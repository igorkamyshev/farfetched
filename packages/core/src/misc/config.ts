class InvalidConfigException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export { InvalidConfigException };
