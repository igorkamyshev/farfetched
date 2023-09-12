[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/packages/typed-contracts/src)

The `contract.ts` file in the `typed-contracts/src` directory is a crucial part of the farfetched project. It contains a function named `typedContract` that transforms a `typed-contracts` Contract into an internal Contract. This function is used to validate data against a given contract and handle any errors that occur during the validation process.

The `typedContract` function takes in a `typed-contracts` Contract for valid data as a parameter. This contract defines the structure and constraints that the data must adhere to. The function then returns an internal Contract that can be used to validate data against the provided contract.

The internal Contract has two main functions: `isData` and `getErrorMessages`. The `isData` function checks if a raw value conforms to the provided contract and returns a boolean value indicating whether the data is valid or not. The `getErrorMessages` function returns an array of error messages if the data does not conform to the contract.

Here is an example of how to use these functions:

```typescript
const contract = typedContract<string>((name, value) => {
  // Define contract rules here
});

const isValid = contract.isData('example'); // true
const errorMessages = contract.getErrorMessages(123); // ['Invalid value']
```

The code also includes a helper function called `traverseError`, which is used by the `getErrorMessages` function to recursively traverse nested errors and extract error messages.

Overall, this code provides a way to transform a `typed-contracts` Contract into an internal Contract that can be used to validate data against the provided contract and handle any errors that occur during the validation process. It ensures that the data being processed adheres to the defined contract, maintaining data integrity and preventing potential issues downstream.
