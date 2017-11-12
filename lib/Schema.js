const util = require('util');
const { Optional, Any } = require('./Types');

/* istanbul ignore next */
const defaultOptions = {
    dateParser: value => new Date(value),
    errorProducer: (field, type) => `throw Error('${field} is not a ${type}.')`,
};

/**
 * Schema that can validate types and forms of some value.
 */
class Schema {
    constructor(schema, options = {}) {
        this.schema = schema;
        this.options = Object.assign(options, defaultOptions);

        const code = this.compileCode(schema);
        this.validationFunction = new Function('x', code);
    }

    /**
     * Validates given value to the schema.
     * @param {object} value
     *
     * By default, it throws error if the value is invalid.
     * You can change this behavior (for example, returning some
     * value) by giving custom errorProducer to options.
     */
    validate(value) {
        return this.validationFunction(value);
    }

    compileCode(schema, field = 'x', fieldName = 'value') {
        const errorBuilder = type => this.options.errorProducer(fieldName, type);

        if (schema === Number || schema === 'number') {
            return `if (typeof ${field} !== 'number') ${errorBuilder('number')};`;

        } else if (schema === String || schema === 'string') {
            return `if (typeof ${field} !== 'string') ${errorBuilder('string')};`;

        } else if (schema === Boolean || schema === 'boolean') {
            return `if (typeof ${field} !== 'boolean') ${errorBuilder('boolean')};`;

        } else if (schema === Array || schema === 'array') {
            return `if (!(${field} instanceof Array)) ${errorBuilder('Array')};`;

        } else if (schema === Object || schema === 'object') {
            return `if (!(${field} instanceof Object)) ${errorBuilder('Object')};`;

        } else if (schema === Date || schema === 'date') {
            const dateParser = this.options.dateParser.toString();
            return `if (!(${field} instanceof Date) && `
                + `isNaN((${dateParser})(${field}).getTime())) ${errorBuilder('Date')};`;

        } else if (schema === Any || schema === 'any') {
            return '';

        } else if (schema instanceof Optional || (typeof schema === 'string' && schema.startsWith('?'))) {
            const actualSchema = schema instanceof Optional
                ? schema.type
                : schema.slice(1);

            return `if (${field} !== undefined && ${field} !== null) { ` +
                `${this.compileCode(actualSchema, field, fieldName)} };`;

        } else if (schema instanceof Array || (typeof schema === 'string' && schema.endsWith('[]'))) {
            const innerSchema = schema instanceof Array
                ? schema[0]
                : schema.slice(0, schema.length - 2);

            const innerSchemaValidationCode = this.compileCode(innerSchema, 'item', `${fieldName}.$`);

            return `if (!(${field} instanceof Array)) ${errorBuilder('Array')};`
                + `${field}.forEach(function(item) { ${innerSchemaValidationCode} });`;

        } else if (schema instanceof Schema) {
            const actualSchema = schema.schema;
            return this.compileCode(actualSchema, field, fieldName);

        } else if (schema instanceof Object && !(schema instanceof Function)) {
            const innerSchemaValidationCode = Object.keys(schema)
                .map((key) => {
                    const innerSchema = schema[key];
                    return this.compileCode(innerSchema, `${field}.${key}`, `${fieldName}.${key}`);
                })
                .join('');

            return `if (!(${field} instanceof Object)) ${errorBuilder('Object')};`
                + innerSchemaValidationCode;
        }
        const typeName = util.inspect(schema);
        throw Error(`Unknown schema type ${typeName} for ${fieldName}`);
    }
}

module.exports = Schema;
