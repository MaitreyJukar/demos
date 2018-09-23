/*
 * Write a function that takes a binary function, and makes it callable
 * with two invocations.
**/

const applyf =
  fn =>
    x =>
      y =>
        fn(x,y);
