const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const CELL = 40;
const BOARD = { x: 20, y: 20, cols: 8, rows: 8 };
const TRAY = { x: 20, y: 380 };

const boardState = Array.from({ length: BOARD.rows }, () => Array(BOARD.cols).fill(0));
for (let r = 2; r < 6; r++) boardState[r][4] = 1;

const piece = {
  cells: [
    [0, 0], [1, 0], [2, 0], [1, 1],
  ],
  originX: TRAY.x + 40,
  originY: TRAY.y + 20,
};

const drag = {
  active: false,
  pointerX: piece.originX,
  pointerY: piece.originY,
  grabDx: 0,
  grabDy: 0,
};

function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function drawCell(px, py, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
  ctx.globalAlpha = 1;
}

function drawBoard() {
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(BOARD.x, BOARD.y, BOARD.cols * CELL, BOARD.rows * CELL);

  for (let r = 0; r < BOARD.rows; r++) {
    for (let c = 0; c < BOARD.cols; c++) {
      const x = BOARD.x + c * CELL;
      const y = BOARD.y + r * CELL;
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(x, y, CELL, CELL);
      if (boardState[r][c]) drawCell(x, y, '#64748b');
    }
  }
}

function getCandidateBoardCell(anchorX, anchorY) {
  const col = Math.round((anchorX - BOARD.x) / CELL);
  const row = Math.round((anchorY - BOARD.y) / CELL);
  return { col, row };
}

function checkPlacement(anchorCol, anchorRow) {
  for (const [dx, dy] of piece.cells) {
    const c = anchorCol + dx;
    const r = anchorRow + dy;
    if (c < 0 || c >= BOARD.cols || r < 0 || r >= BOARD.rows) return false;
    if (boardState[r][c]) return false;
  }
  return true;
}

function drawGhost() {
  if (!drag.active) return;
  const anchorX = drag.pointerX - drag.grabDx;
  const anchorY = drag.pointerY - drag.grabDy;
  const { col, row } = getCandidateBoardCell(anchorX, anchorY);
  const valid = checkPlacement(col, row);
  const tint = valid ? '#22c55e' : '#ef4444';

  for (const [dx, dy] of piece.cells) {
    const c = col + dx;
    const r = row + dy;
    const x = BOARD.x + c * CELL;
    const y = BOARD.y + r * CELL;
    drawCell(x, y, tint, 0.45);
  }
}

function drawFloatingPiece() {
  const anchorX = drag.active ? drag.pointerX - drag.grabDx : piece.originX;
  const anchorY = drag.active ? drag.pointerY - drag.grabDy : piece.originY;

  // Draw as one grouped unit with consistent offset from pointer.
  for (const [dx, dy] of piece.cells) {
    drawCell(anchorX + dx * CELL, anchorY + dy * CELL, '#38bdf8', drag.active ? 0.95 : 1);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();

  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, TRAY.y, canvas.width, canvas.height - TRAY.y);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Piece Tray', TRAY.x, TRAY.y - 8);

  drawGhost();
  drawFloatingPiece();
}

canvas.addEventListener('pointerdown', (e) => {
  const p = pointerPos(e);
  const localX = p.x - piece.originX;
  const localY = p.y - piece.originY;

  for (const [dx, dy] of piece.cells) {
    const x = dx * CELL;
    const y = dy * CELL;
    if (localX >= x && localX < x + CELL && localY >= y && localY < y + CELL) {
      drag.active = true;
      drag.pointerX = p.x;
      drag.pointerY = p.y;
      drag.grabDx = localX - x;
      drag.grabDy = localY - y;
      canvas.setPointerCapture(e.pointerId);
      break;
    }
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (!drag.active) return;
  const p = pointerPos(e);
  drag.pointerX = p.x;
  drag.pointerY = p.y;
});

canvas.addEventListener('pointerup', (e) => {
  if (!drag.active) return;
  const anchorX = drag.pointerX - drag.grabDx;
  const anchorY = drag.pointerY - drag.grabDy;
  const { col, row } = getCandidateBoardCell(anchorX, anchorY);
  if (checkPlacement(col, row)) {
    for (const [dx, dy] of piece.cells) {
      boardState[row + dy][col + dx] = 1;
    }
  }
  drag.active = false;
  piece.originX = TRAY.x + 40;
  piece.originY = TRAY.y + 20;
  canvas.releasePointerCapture(e.pointerId);
});

function loop() {
  render();
  requestAnimationFrame(loop);
}

loop();
