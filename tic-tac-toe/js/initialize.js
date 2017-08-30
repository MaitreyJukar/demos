var WINNING_POS = [
    '111000000',
    '000111000',
    '000000111',
    '100010001',
    '001010100',
    '100100100',
    '010010010',
    '001001001'
].map(function(val, idx) {
    return parseInt(val, 2);
});

$(document).ready(function() {
    var TicTacToe = new Board();
});