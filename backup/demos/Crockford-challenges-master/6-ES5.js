/*
 * Write a function that takes a function and an argument,
 * and returns a function that can supply a second argument.
**/

function curry(fn, x) {
  return function(y) {
    return fn(x,y);
  };
}
