/*
 * Write a function 'composeb' thst takes two binary
 * functions and returns a function that calls them both
**/

const composeb =
  (fn1, fn2) =>
    (x, y, z) =>
      fn2(z, fn1(x, y));

// composeb(add, mul)(2, 3, 5);

