interface Contract<Raw, Data, Error> {
  /**
   * It transforms prepared Response for doneData
   */
  data: {
    /**
     * It validates prepared Response
     *
     * - return `null` or empty array for valid response
     * - return array of string with validation erorrs for InvalidDataError in failData
     */
    validate: (prepared: Raw) => string[] | null;
    /**
     * Transforms **valid** prepared Response for doneData
     */
    extract: (prepared: Raw) => Data;
  };
  /**
   * It transforms prapared Response for failData
   */
  error: {
    /**
     * It checks if prepared Response is some ApiError
     *
     * @example
     *
     * const callApiFx = createApiRequest({
     *   error: {
     *     is: async (preapred) => prepared.error === true,
     *   },
     * })
     */
    is: (prepared: Raw) => boolean;
    /**
     * Transforms **failed** prepared Response for ApiError in failData
     */
    extract: (prepared: Raw) => Error;
  };
}

export { type Contract };
