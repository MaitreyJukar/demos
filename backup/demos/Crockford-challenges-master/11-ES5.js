/*
 * Write a function 'composeu' that takes two unary functions
 * and returns a unary function that calls them both.
**/

function composeu(fn1, fn2) {
  return function(x) {
    return fn2(fn1(x));
  };
}
