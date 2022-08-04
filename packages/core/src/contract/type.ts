interface Contract<Raw, Data extends Raw, Error extends Raw> {
  /**
   * Checks if Response is some Data
   */
  isData: (prepared: Raw) => prepared is Data;
  /**
   * Validates Response
   *
   * - return `null` or empty array for valid response
   * - return array of string with validation erorrs for InvalidDataError in failData
   */
  getValidationErrors: (prepared: Raw) => string[];
  /**
   * Checks if Response is Error
   */
  isError: (prepared: Raw) => prepared is Error;
}

export { type Contract };
