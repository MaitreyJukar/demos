/*
 * Write a function that takes a function and an argument,
 * and returns a function that can supply a second argument.
**/

const curry = 
  (fn, x) =>
    y =>
      fn(x,y);
