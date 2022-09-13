interface Contract<Raw, Data extends Raw> {
  /**
   * Checks if Response is some Data
   */
  isData: (prepared: Raw) => prepared is Data;
  /**
   * - `null` or empty array is dedicated for valid response
   * - array of string with validation erorrs for invalidDataError
   */
  getErrorMessages: (prepared: Raw) => string[];
}

export { type Contract };
