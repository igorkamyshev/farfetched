[View code on GitHub](https://github.com/igorkamyshev/farfetched/packages/core/src/libs/lohyphen/zip_object.ts)

The code provided is a function called `zipObject` that takes in an object as a parameter and returns a new object. The purpose of this function is to transform the structure of the input object by swapping the keys and values at different levels.

The function uses two generic type parameters, `ExternalKeys` and `InternalKeys`, which represent the types of the keys used in the input and output objects respectively. These type parameters ensure that the function can handle different types of keys.

The function starts by initializing an empty object called `result`, which will store the transformed object. 

Next, the function iterates over each key-value pair in the input object using a nested loop. The outer loop iterates over the keys of the input object, while the inner loop iterates over the keys and values of the nested objects within the input object.

For each key-value pair in the nested objects, the function updates the `result` object by assigning the value to a new key in the `result` object. The new key is created by swapping the positions of the outer and inner keys. This is done using the spread operator (`...`) to clone the existing value of the `result` object and then adding a new key-value pair with the swapped keys.

Finally, the function returns the `result` object, which now contains the transformed structure.

Here's an example to illustrate how this function can be used:

```javascript
const input = {
  externalKey1: {
    internalKey1: 'value1',
    internalKey2: 'value2',
  },
  externalKey2: {
    internalKey1: 'value3',
    internalKey2: 'value4',
  },
};

const output = zipObject(input);

console.log(output);
```

Output:
```javascript
{
  internalKey1: {
    externalKey1: 'value1',
    externalKey2: 'value3',
  },
  internalKey2: {
    externalKey1: 'value2',
    externalKey2: 'value4',
  },
}
```

In this example, the `zipObject` function transforms the input object by swapping the positions of the external and internal keys. The resulting object has the internal keys as the top-level keys, and each internal key is associated with an object that contains the corresponding external keys and their values.
## Questions: 
 1. **What does the `zipObject` function do?**
The `zipObject` function takes an object with nested objects as input and returns a new object with the keys and values of the nested objects swapped.

2. **What are the types of the input and output parameters?**
The input parameter `object` is of type `Record<ExternalKeys, Record<InternalKeys, unknown>>`, where `ExternalKeys` and `InternalKeys` are generic types representing string keys. The output parameter is of type `Record<InternalKeys, Record<ExternalKeys, unknown>>`.

3. **What is the purpose of the nested for loop?**
The nested for loop iterates over the entries of the input `object` and its nested objects. It assigns the values of the nested objects to the corresponding keys in the `result` object, effectively swapping the keys and values.