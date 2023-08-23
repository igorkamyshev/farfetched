export interface Contract<Raw, Data extends Raw> {
  /**
   * Checks if Raw is some Data
   */
  isData: (prepared: Raw) => prepared is Data;
  /**
   * - empty array is dedicated for valid response
   * - array of string with validation erorrs for invalidDataError
   */
  getErrorMessages: (prepared: Raw) => string[];
}
