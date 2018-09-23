const counterf = x => {
  return {
    inc() {
      return x += 1;
    },
    dec() {
      return x -= 1;
    }
  };
};
