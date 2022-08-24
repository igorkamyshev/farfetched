interface Contract<Raw, Data extends Raw, Error extends Raw> {
  /**
   * Checks if Response is some Data
   */
  isData: (prepared: Raw) => prepared is Data;
  /**
   * - `null` or empty array is dedicated for valid response
   * - array of string with validation erorrs for invalidDataError
   */
  getErrorMessages: (prepared: Raw) => string[];
  /**
   * Checks if Response is Error
   */
  isError: (prepared: Raw) => prepared is Error;
}

export { type Contract };
