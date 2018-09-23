/*
 * Without writing any new functions, show three ways to create 
 * the 'inc' function.
**/

const add = (x,y) => x + y;

const addf = 
  x =>
    y =>
      x + y;

const applyf =
  fn =>
    x =>
      y =>
        fn(x,y);

const curry =
  (fn, x) =>
    y =>
      fn(x,y);

const inc1 = addf(1);
const inc2 = applyf(add)(1);
const inc3 = curry(add, 1);
