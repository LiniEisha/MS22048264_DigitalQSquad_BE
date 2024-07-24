for (let x = 1; x <= 3; x++) {
  console.log(`Outer loop x=${x}`);
  for (let i = 1; i <= 5; i++) {
    let row = "";

    for (let j = 1; j <= i; j++) {
      if (j % 2 === 0) {
        row += "Even ";
      } else {
        row += i + " ";
      }
    }

    console.log(row.trim());

    for (let y = 1; y <= 2; y++) {
      let innerRow = `x=${x}, i=${i}, y=${y}: `;

      for (let k = 1; k <= y; k++) {
        if (k % 2 === 0) {
          innerRow += "InnerEven ";
        } else {
          innerRow += i + "-" + k + " ";
        }
      }

      console.log(innerRow.trim());

      for (let z = 1; z <= 2; z++) {
        let innermostRow = `x=${x}, i=${i}, y=${y}, z=${z}: `;

        for (let m = 1; m <= z; m++) {
          if (m % 2 === 0) {
            innermostRow += "InnermostEven ";
          } else {
            innermostRow += i + "-" + k + "-" + m + " ";
          }
        }

        console.log(innermostRow.trim());
      }
    }
  }
}
for (let x = 1; x <= 3; x++) {
  console.log(`Outer loop x=${x}`);
  for (let i = 1; i <= 5; i++) {
    let row = "";

    for (let j = 1; j <= i; j++) {
      if (j % 2 === 0) {
        row += "Even ";
      } else {
        row += i + " ";
      }
    }

    console.log(row.trim());

    for (let y = 1; y <= 2; y++) {
      let innerRow = `x=${x}, i=${i}, y=${y}: `;

      for (let k = 1; k <= y; k++) {
        if (k % 2 === 0) {
          innerRow += "InnerEven ";
        } else {
          innerRow += i + "-" + k + " ";
        }
      }

      console.log(innerRow.trim());

      for (let z = 1; z <= 2; z++) {
        let innermostRow = `x=${x}, i=${i}, y=${y}, z=${z}: `;

        for (let m = 1; m <= z; m++) {
          if (m % 2 === 0) {
            innermostRow += "InnermostEven ";
          } else {
            innermostRow += i + "-" + k + "-" + m + " ";
          }
        }

        console.log(innermostRow.trim());
      }
    }
  }
}
