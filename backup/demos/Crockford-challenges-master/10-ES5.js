/*
 * Write a function 'twice' that takes a binary function and returns a unary function, 
 * that passes it's argument to the binary function twice.
**/

function twice(fn) {
  return function(x) {
    return fn(x,x);
  };
}
