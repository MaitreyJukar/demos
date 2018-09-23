/*
 * Write a function that takes a binary function, and makes it callable
 * with two invocations.
**/

function applyf(fn) {
  return function(x) {
    return function(y) {
      return fn(x,y);
    };
  };
}
