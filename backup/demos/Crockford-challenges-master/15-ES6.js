/*
 * Make a revocable function that takes a nice
 * function and returns a `revoke` function that
 * denies access to the nice function, and an `invoke`
 * function that can invoke the nice function until
 * it is revoked.
**/

const revocable = fn => {
  return {
    invoke(...args) {
      return fn.apply(this, args)
    },
    revoke() {
      fn = null;
    }
  };
};
