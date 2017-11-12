const assert = require('assert');
const { Schema, Any, Optional } = require('..');

describe('Schema', function() {
    describe('#validate()', function() {
        it('should handle Number type', function() {
            const schema = new Schema(Number);
            schema.validate(1234);
            schema.validate(Math.PI);
            assert.throws(() => schema.validate('fail'), Error);
        });

        it('should handle String type', function() {
            const schema = new Schema(String);
            schema.validate('hello');
            assert.throws(() => schema.validate(1234), Error);
        });

        it('should handle Boolean type', function() {
            const schema = new Schema(Boolean);
            schema.validate(true);
            assert.throws(() => schema.validate(1234), Error);
        });

        it('should handle Array type', function() {
            const schema = new Schema(Array);
            schema.validate(['any', 'items', 3, 4]);
            schema.validate([]);
            assert.throws(() => schema.validate(1234), Error);
        });

        it('should handle Object type', function() {
            const schema = new Schema(Object);
            schema.validate({});
            schema.validate(new Date());
            schema.validate([3, 2, 1]);
            assert.throws(() => schema.validate('hello'), Error);
        });

        it('should handle Date type', function() {
            const schema = new Schema(Date);
            schema.validate(new Date());
            schema.validate('2017-11');
            schema.validate('2017-11-11T19:11:33.786Z');
            schema.validate(1510427489747);
            assert.throws(() => schema.validate('2017-3-111'), Error);
        });

        it('should handle Any type', function() {
            const schema = new Schema({ foo: Any });
            schema.validate({ foo: 1234 });
            schema.validate({ foo: 'hello' });
            schema.validate({});
        });

        it('should handle optional type', function() {
            const schema = new Schema({ foo: Optional(String) });
            schema.validate({});
            schema.validate({ foo: 'Hello' });
            assert.throws(() => schema.validate({foo: 1234}), Error);
        });

        it('should handle optional type with shorthand', function() {
            const schema = new Schema({ foo: '?string' });
            schema.validate({});
            schema.validate({ foo: 'Hello' });
            assert.throws(() => schema.validate({foo: 1234}), Error);
        });

        it('should handle array-inner schema', function() {
            const schemaStr = new Schema([String]);
            const schemaNum = new Schema([Number]);
            schemaStr.validate(['array', 'with', 'string', 'items']);
            schemaNum.validate([1, 2, 3, 4]);

            // empty arrays should be fine.
            schemaStr.validate([]);
            schemaNum.validate([]);

            assert.throws(() => schemaStr.validate(1234), Error);
            assert.throws(() => schemaStr.validate([1, 2, 3, 4]), Error);
        });

        it('should handle array-inner schema with shorthand', function() {
            const schemaStr = new Schema('string[]');
            const schemaNum = new Schema('number[]');
            schemaStr.validate(['array', 'with', 'string', 'items']);
            schemaNum.validate([1, 2, 3, 4]);

            assert.throws(() => schemaStr.validate(1234), Error);
            assert.throws(() => schemaStr.validate([1, 2, 3, 4]), Error);
        });

        it('should handle object-inner schema', function() {
            const schema = new Schema({
                hello: String,
                world: Number,
            });

            schema.validate({ hello: 'hello', world: 1234 });
            schema.validate({ hello: 'hello', world: 1234, additionalProperty: 'allowed' });

            // must have required fields
            assert.throws(() => schema.validate({hello: 'hello'}), Error);
        });

        it('should handle schema-in-schema', function() {
            const innerSchema = new Schema({
                god: String,
                damn: Number,
            });

            const schema = new Schema({
                hello: String,
                inner: innerSchema,
            });

            schema.validate({
                hello: 'hello',
                inner: {
                    god: 'god',
                    damn: 1234,
                }
            });

            assert.throws(() => schema.validate({hello: 'hello', inner: { god: 1234 }}), Error);
        });

        it('should handle complicated schema', function() {
            const User = new Schema({
                id: Number,
                name: String,
                age: Optional(Number),
            });

            const Post = new Schema({
                author: User,
                title: String,
                body: '?string',
                comments: [{
                    author: User,
                    createdAt: 'date',
                    liked: [User],
                }]
            });

            const correctData = {
                author: { id: 1, name: 'Jane Doe', age: 36 },
                title: 'This is my sample post.',
                body: 'Lorem Ipsum dolar sit amet.',
                comments: [
                    {
                        author: { id: 2, name: 'John Smith' },
                        createdAt: '2017-11-11T19:11:33.786Z',
                        liked: [],
                    },
                    {
                        author: { id: 2, name: 'John Smith' },
                        createdAt: '2017-11-11T19:11:33.786Z',
                        liked: [{ id: 3, name: 'Gildong Hong' }, { id: 4, name: 'James Smith' }],
                    },
                ]
            };
            Post.validate(correctData);

            // this data is missing comments.$.liked.$.id
            const incorrectData = {
                author: { id: 1, name: 'Jane Doe', age: 36 },
                title: 'This is my sample post.',
                body: 'Lorem Ipsum dolar sit amet.',
                comments: [
                    {
                        author: { id: 2, name: 'John Smith' },
                        createdAt: '2017-11-11T19:11:33.786Z',
                        liked: [],
                    },
                    {
                        author: { id: 2, name: 'John Smith' },
                        createdAt: '2017-11-11T19:11:33.786Z',
                        liked: [{ id: 3, name: 'Gildong Hong' }, { name: 'James Smith' }],
                    },
                ]
            };
            assert.throws(() => Post.validate(incorrectData), Error);
        });

        it('should throw error if unknown type is present', function() {
            function MyOwnType() {}
            assert.throws(() => new Schema(MyOwnType), Error);
        });
    });
});
