module.exports.checkWin = (board, role) => {
  const winPatterns = [
    [0, 1, 2], // row
    [3, 4, 5], // row
    [6, 7, 8], // row
    [0, 3, 6], // column
    [1, 4, 7], // column
    [2, 5, 8], // column
    [0, 4, 8], // diagonal
    [2, 4, 6], // diagonal
  ];

  return winPatterns.some((pattern) =>
    pattern.every((index) => board[index] == role)
  );
};

module.exports.isBoardFull = (board) => {
  return board.every((cell) => cell !== "");
};
