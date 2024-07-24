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
}
