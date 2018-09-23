/*
 * Write methodize, a function that converts a binary function to a method.
**/

const methodize =
  fn =>
    y =>
      fn(this, y);
