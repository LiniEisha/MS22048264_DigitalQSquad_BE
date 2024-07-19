class ComplexOperations {
    complexity18Function() {
      let result = 0;
      for (let i = 0; i < 5; i++) {
        if (i % 2 === 0) {
          for (let j = 0; j < 5; j++) {
            if (j % 3 === 0) {
              for (let k = 0; k < 5; k++) {
                if (k % 2 === 0) {
                  result += i * j * k;
                } else {
                  result -= i * j * k;
                }
              }
            } else {
              result += i * j;
            }
          }
        } else {
          result -= i;
        }
      }
      return result;
    }
  }
  
  // Example usage:
  const complexOps = new ComplexOperations();
  const result = complexOps.complexity18Function();
  console.log(result);
  