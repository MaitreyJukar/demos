
/*
 * Write demethodize, a function that converts a method into a 
 * binary function.
**/

const demethodize = 
  fn =>
    (x, y) =>
      fn.call(x, y);
