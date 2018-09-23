/*
 * Write a function 'composeb' thst takes two binary
 * functions and returns a function that calls them both
**/

function composeb(fn1, fn2) {
  return function(x, y, z) {
    return fn2(z, fn1(x, y))
  }
}

// composeb(add, mul)(2, 3, 5);
