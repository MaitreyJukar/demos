task 2
function countMatchingPairs(str) {
    var regExp = /([a-z])(?=[a-z]*\1)/g,
        martchingPairs;

    martchingPairs = str.match(regExp);
    return martchingPairs.length;
}


task 1 
number of 7 in units place = diff of numbers/10 == 22

in tens place 10 times in every 100 but it includes 70's section thrice so 

30 + 22 = 52
