/*
 * Without writing any new functions, show three ways to create 
 * the 'inc' function, using functions created on the previous six problems.
**/

function add(x,y) {
  return x + y;
}

function addf(x) {
  return function(y) {
    return x + y;
  };
}

function applyf(fn) {
  return function(x) {
    return function(y) {
      return fn(x,y);
    };
  };
}

function curry(fn, x) {
  return function(y) {
    return fn(x,y);
  };
}


var inc1 = addf(1);
var inc2 = applyf(add)(1);
var inc3 = curry(add, 1);
