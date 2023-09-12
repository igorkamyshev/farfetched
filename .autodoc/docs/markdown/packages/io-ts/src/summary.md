[View code on GitHub](https://github.com/igorkamyshev/farfetched/.autodoc/docs/json/packages/io-ts/src)

The `contract.ts` file in the `io-ts` package of the `farfetched` project contains a function named `ioTsContract`. This function is used to transform an `io-ts` Type into a Contract, which is an object with two properties: `isData` and `getErrorMessages`.

The `io-ts` library is used for runtime type checking and decoding/encoding of values in TypeScript. The `ioTsContract` function takes an `io-ts` Type as a parameter and returns a Contract. This Contract can be used to validate data and handle errors.

The `isData` property is a function that checks if a given value conforms to the `io-ts` Type. If the value does conform, it returns `true`, otherwise it returns `false`.

The `getErrorMessages` property is a function that takes a raw value and returns an array of error messages. If the raw value conforms to the `io-ts` Type, it returns an empty array. If it doesn't, it attempts to decode the raw value and returns an array of error messages if decoding fails.

Here is an example of how the `ioTsContract` function might be used:

```typescript
import * as t from 'io-ts';

const User = t.type({
  id: t.number,
  name: t.string,
  email: t.string,
});

const userContract = ioTsContract(User);

const userData = {
  id: 1,
  name: 'John Doe',
  email: 'johndoe@example.com',
};

console.log(userContract.isData(userData)); // true

const invalidUserData = {
  id: '1',
  name: 'John Doe',
  email: 'johndoe@example.com',
};

console.log(userContract.getErrorMessages(invalidUserData));
// ["Invalid value "1" supplied to : { id: number }/id: number"]
```

In this example, a `User` Type is defined using `io-ts`. A Contract is then created using the `ioTsContract` function and the `User` Type. The Contract's `isData` method is used to check if a user data object conforms to the `User` Type, and the `getErrorMessages` method is used to get any error messages if the data is invalid.
