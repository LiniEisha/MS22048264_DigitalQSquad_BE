function highComplexArrayOperations(arr1, arr2) {
    let result = [];

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] % 2 === 0) {
            result.push(arr1[i] * 2);
            for (let j = 0; j < arr2.length; j++) {
                if (arr2[j] % 3 === 0) {
                    result.push(arr2[j] + 1);
                }
            }
        } else {
            result.push(arr2[i] + 1);
        }
    }

    return result;
}
