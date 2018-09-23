/*
 * Write a function 'composeu' that takes two unary functions
 * and returns a unary function that calls them both.
**/

const composeu =
  (fn1, fn2) =>
    x =>
      fn2(fn1(x));
