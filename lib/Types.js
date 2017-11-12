
class Type {

}

/**
 * Any represents any type in {@link Schema}.
 */
class Any {}

/**
 * Optional Type.
 * @param {Function|String} type
 *
 * NOTE THAT this class is defined using pre-ES6 style
 *   to allow initiate object without 'new' keyword.
 */
function Optional(type) {
    if (!(this instanceof Optional)) return new Optional(type);
    this.type = type;
}

module.exports = { Type, Optional, Any };