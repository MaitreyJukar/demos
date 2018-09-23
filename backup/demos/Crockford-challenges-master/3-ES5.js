/*
 * Write a function that takes an argument and returns a 
 * function that returns that argument
**/

function identityf(arg) {
  return function() {
    return arg;
  };
}
