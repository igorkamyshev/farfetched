# Do not trust remote data

Farfetched is built to handle remote data that your application does not control.

We believe that if you cannot control some data source, you should not trust it. So, any [_Query_](/api/primitives/query.md) by default interpret received data as `unkown`, if you want to cast the data to some specific type, you have to use [_Contract_](/api/primitives/contract.md).
