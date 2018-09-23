var array = [];

function addUsingFor(numArr) {
    var sum = 0;
    for (var i = 0; i < numArr.length; i++) {
        sum += numArr[i];
    }
    return sum;
}

function addUsingWhile(numArr) {
    var i = 0,
        sum = 0;
    while (i < numArr.length) {
        sum += numArr[i];
        i++;
    }
    return sum;
}

function addUsingAdd(numArr, index, sum) {
    index = index || 0;
    sum = sum || 0;
    if (index === numArr.length - 1) {
        return numArr[index];
    }
    index++;
    return sum + addUsingAdd(numArr, index, sum);
}
