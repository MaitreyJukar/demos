
/*
 * Write demethodize, a function that converts a method into a 
 * binary function.
**/

function demethodize(fn) {
  return function(x, y) {
    return fn.call(x, y);
  };
}
