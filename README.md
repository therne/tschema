# Tschema

[![Build Status](https://img.shields.io/travis/therne/tschema/master.svg?style=flat-square)](https://travis-ci.org/therne/tschema)
[![Coveralls Status](https://img.shields.io/coveralls/github/therne/tschema/master.svg?style=flat-square)](https://coveralls.io/github/therne/tschema)
[![NPM version](https://img.shields.io/npm/v/tschema.svg?style=flat-square)](https://www.npmjs.com/package/tschema)

Tschema is simple and fastest static type checker for Node.js.

### Why it's the Fastest?
Because Tschema compiles scheme validation code into single static function - containing only `if` statements.  
So Tschema doesn't parse the schema at runtime. It only consumes *O(1)* on validation time.

### Install

```
npm install tschema
```

### Example

```js
const { Schema, Optional } = require('tschema');

const User = new Schema({
  name: String,
  age: Number,
  friends: [String],
  info: {
    createdAt: Date,
    lastLoginedAt: Optional(Date),
  },
});

User.validate({ name: 'John', age: 20, friends: ['foo', 'bar'], info: { createdAt: Date.now() } });
```

## Documentations

### Defining a Schema

```
new Schema(schema, options)
```
You can create schema using `tschema.Schema` class.

* `schema`: Any type or object.

  Available types are:
    * `Number` `String` `Boolean` - Primitives
    * `Array` - Any `Array`
    * `Object` - Any `Object` (all non-primitive types) 
    * `Date`
    * `Any` - Anything including `null`, `undefined`
    * `Optional(Type)` - Given type but `null`, `undefined` are allowed
    * `[Type]` - Array of given type
    * `{ ... }` - Nested object
    * `Schema` - Another `Schema`
  
  Instead of giving constructors or `Optional`, you can define schema using [Flow](https://flow.org) style.

  ```js
  const User = new Schema({
    name: 'string',
    age: 'number',
    friends: 'string[]',
    createdAt: '?date',
  });
  ```
  
  * `'number'`, `'string'`, `'boolean'` - Primitives
  * `'array'`, `'object'`, `'date'`, `'any'`
  * `'?type'` - Optional
  * `'type[]'` - Array of given type
  

* `options`: You can pass some options if you want. These options will be
  * `errorProducer`: The error function.
  * `dateParser`: Date parser function.

### Customizing a Schema

#### Change error behavior
In default, `Schema#validate` will throw an `Error` if given value is invalid.

```js
errorProducer: (field, type) => throw Error(`${field} is not a ${type}.`)
```

You can change this behavior by passing your own `errorProducer` to `options`.  
For example, if you want to return some object if `Schema#validate` fails, you need to do like this:

```js
const User = new Schema({ ... }, {
  errorProducer: (field, type) => ({ error: { name: field, tobe: type } })
});
```

#### Use custom date parser
In default, Tschema parses `Date` type using `new Date`.

```js
dateParser: (value) => new Date(value)
```

You can replace this parser by passing your own `dateParser` to `options`.

## TODO

* Named Schema for self-embedding (ex: `User = new Schema('User', { author: 'User' })`)
* Strict mode (fails at `verify` if given value has fields undefined on schema)
* Integration with ORM / ODM libraries (`sequelize`, `mongorito`, `mongoose`, ...)
* [TypeScript](https://typescriptlang.org), [Flow](https://flow.org) support

## License: MIT
