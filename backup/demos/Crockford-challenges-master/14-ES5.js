/*
 * Write a factory function that returns two functions
 * that implement an up/down counter.
**/

function counterf(x) {
  return {
    inc: function() {
      return x+= 1;
    },
    dec: function() {
      return x-=1;
    }
  };
}
