class InvalidDataError<Raw> extends Error {
  constructor(
    readonly raw: Raw,
    /** Messages returned from `data.validate` */
    readonly validationMessages: string[]
  ) {
    super(`Invalid data in response`);
  }
}

export { InvalidDataError };
