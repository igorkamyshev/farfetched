[View code on GitHub](https://github.com/igorkamyshev/farfetched/packages/core/src/contract/type.ts)

The code provided is an interface called `Contract` that defines two methods: `isData` and `getErrorMessages`. This interface is likely used in the larger project to define a contract or set of rules for validating and processing data.

The `isData` method takes a parameter `prepared` of type `Raw` and returns a boolean value indicating whether the `prepared` data is of type `Data`. The `is` keyword is used to perform a type guard check, ensuring that the `prepared` data is of the specified `Data` type. This method is useful for checking if the data meets certain criteria or requirements before further processing.

Here is an example usage of the `isData` method:

```typescript
const contract: Contract<SomeRawType, SomeDataType> = {
  isData: (prepared) => prepared instanceof SomeDataType,
  getErrorMessages: (prepared) => [],
};

const rawData: SomeRawType = ... // some raw data
if (contract.isData(rawData)) {
  // Process the data as SomeDataType
} else {
  // Handle the case where the data is not of type SomeDataType
}
```

The `getErrorMessages` method takes a parameter `prepared` of type `Raw` and returns an array of strings. This method is used to retrieve any validation error messages associated with the `prepared` data. If the data is valid, an empty array is returned. If the data is invalid, the array contains strings describing the validation errors.

Here is an example usage of the `getErrorMessages` method:

```typescript
const contract: Contract<SomeRawType, SomeDataType> = {
  isData: (prepared) => prepared instanceof SomeDataType,
  getErrorMessages: (prepared) => {
    if (prepared.someProperty === undefined) {
      return ['someProperty is required'];
    }
    return [];
  },
};

const rawData: SomeRawType = ... // some raw data
const errorMessages = contract.getErrorMessages(rawData);
if (errorMessages.length === 0) {
  // Data is valid, proceed with processing
} else {
  // Handle the case where the data is invalid
  console.log('Validation errors:', errorMessages);
}
```

In summary, the `Contract` interface provides a way to define rules for validating and processing data. The `isData` method checks if the data meets the specified type, while the `getErrorMessages` method retrieves any validation error messages associated with the data. These methods can be used in the larger project to ensure data integrity and handle validation errors appropriately.
## Questions: 
 1. **What is the purpose of the `isData` function?**
The `isData` function is used to check if a given value of type `Raw` is of type `Data`.

2. **What does the `getErrorMessages` function return?**
The `getErrorMessages` function returns an array of strings that represent validation error messages for the given `prepared` value of type `Raw`.

3. **What are the constraints on the `Data` type?**
The code does not provide any explicit constraints on the `Data` type. It only specifies that `Data` must extend `Raw`.