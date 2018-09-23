/*
 * Write a function that allows another function
 * to be only called once
**/

function once(fn) {
  return function() {
    var func = fn;
    fn = null;
    return func.apply(this, arguments);
  };
}
