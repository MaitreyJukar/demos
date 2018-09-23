/*
 * Write methodize, a function that converts a binary function to a method.
**/

function methodize(fn) {
  return function(y) {
    return fn(this, y);
  };
}
