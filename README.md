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

### Creating a Schema

```
new Schema(schema, options)
```
You can create schema using Schema class.

* `schema`: any type or object.  

  Alternatively, you can make schema with [Flow](https://flow.org) style.

  ```js
  const User = new Schema({
    name: 'string',
    age: 'number',
    friends: 'string[]',
    createdAt: '?date',
  });
  ```

* `options`: You can pass some options if you want. These options will be
  * `errorProducer`: The error function.
  * `dateParser`: Date parser function.

### Customizing a Schema

#### Change error behavior
In default, `Schema#validate` will throw an `Error` if given value is invalid.

```js
errorProducer: (field, type) => `throw Error('${field} is not a ${type}.')`
```

You can change this behavior by passing your own `errorProducer` to `options`.  

**NOTE THAT** the default errorProducer function returns **String** - because the function
will be called on schema-compilation time, not on runtime. So the function must return `String` code fragment
that will be added to the compiled verify function.

So, for example, if you want to return some object if `Schema#validate` fails, you need to do like this:

```js
const User = new Schema({ ... }, {
  errorProducer: (field, type) => `return { error: { name: '${field}', tobe: '${type}' } }`
});
```

#### Use custom date parser
In default, Tschema parses `Date` type using `new Date`.

```js
dateParser: (value) => new Date(value)
```

You can replace this parser by passing your own `dateParser` to `options`.

**NOTE THAT** this `dateParser` will be evaluated to plain code using `Function#toString()`, 
So don't use any external dependency in dateParser function.

## TODO

* Named Schema for self-containing
* Strict mode (fails at `verify` if given value has fields undefined on schema)

## License: MIT