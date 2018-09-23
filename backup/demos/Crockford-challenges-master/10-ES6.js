/*
 * Write a function 'twice' that takes a binary function and returns a unary 
 function, that passes it's argument to the binary function twice.
**/

const twice = 
  fn =>
    x =>
      fn(x, x);
    
