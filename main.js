const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const CONFIG = {
  cellSize: 40,
  board: { x: 20, y: 20, cols: 8, rows: 8 },
  tray: { x: 20, y: 380 },
  colors: {
    bg: '#111827',
    boardBase: '#1f2937',
    boardStroke: '#334155',
    occupied: '#64748b',
    trayBg: '#0b1220',
    trayLabel: '#94a3b8',
    floating: '#38bdf8',
    ghostValid: '#22c55e',
    ghostInvalid: '#ef4444',
  },
};

const CELL = CONFIG.cellSize;
const BOARD = CONFIG.board;
const TRAY = CONFIG.tray;

function createBoard(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

const boardState = createBoard(BOARD.rows, BOARD.cols);
for (let r = 2; r < 6; r += 1) boardState[r][4] = 1;

const piece = {
  cells: [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
  home: { x: TRAY.x + 40, y: TRAY.y + 20 },
  anchor: { x: TRAY.x + 40, y: TRAY.y + 20 },
};

const drag = {
  active: false,
  pointerId: null,
  pointer: { x: piece.anchor.x, y: piece.anchor.y },
  grabOffset: { x: 0, y: 0 },
};

function getPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function drawCell(x, y, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
  ctx.globalAlpha = 1;
}

function drawBoardGrid() {
  ctx.fillStyle = CONFIG.colors.boardBase;
  ctx.fillRect(BOARD.x, BOARD.y, BOARD.cols * CELL, BOARD.rows * CELL);

  for (let r = 0; r < BOARD.rows; r += 1) {
    for (let c = 0; c < BOARD.cols; c += 1) {
      const x = BOARD.x + c * CELL;
      const y = BOARD.y + r * CELL;
      ctx.strokeStyle = CONFIG.colors.boardStroke;
      ctx.strokeRect(x, y, CELL, CELL);
      if (boardState[r][c]) drawCell(x, y, CONFIG.colors.occupied);
    }
  }
}

function drawTray() {
  ctx.fillStyle = CONFIG.colors.trayBg;
  ctx.fillRect(0, TRAY.y, canvas.width, canvas.height - TRAY.y);
  ctx.fillStyle = CONFIG.colors.trayLabel;
  ctx.fillText('Piece Tray', TRAY.x, TRAY.y - 8);
}

function getFloatingAnchor() {
  if (!drag.active) return { ...piece.anchor };
  return {
    x: drag.pointer.x - drag.grabOffset.x,
    y: drag.pointer.y - drag.grabOffset.y,
  };
}

function getCandidatePlacement(anchor) {
  const col = Math.round((anchor.x - BOARD.x) / CELL);
  const row = Math.round((anchor.y - BOARD.y) / CELL);
  return { row, col };
}

function isValidPlacement(col, row) {
  for (const [dx, dy] of piece.cells) {
    const targetCol = col + dx;
    const targetRow = row + dy;
    const isOut = targetCol < 0 || targetCol >= BOARD.cols || targetRow < 0 || targetRow >= BOARD.rows;
    if (isOut) return false;
    if (boardState[targetRow][targetCol]) return false;
  }
  return true;
}

function drawPlacementGhost() {
  if (!drag.active) return;
  const anchor = getFloatingAnchor();
  const { col, row } = getCandidatePlacement(anchor);
  const valid = isValidPlacement(col, row);
  const tint = valid ? CONFIG.colors.ghostValid : CONFIG.colors.ghostInvalid;

  for (const [dx, dy] of piece.cells) {
    const x = BOARD.x + (col + dx) * CELL;
    const y = BOARD.y + (row + dy) * CELL;
    drawCell(x, y, tint, 0.45);
  }
}

function drawFloatingPiece() {
  const anchor = getFloatingAnchor();
  const alpha = drag.active ? 0.95 : 1;

  for (const [dx, dy] of piece.cells) {
    drawCell(anchor.x + dx * CELL, anchor.y + dy * CELL, CONFIG.colors.floating, alpha);
  }
}

function tryPlacePiece() {
  const anchor = getFloatingAnchor();
  const { col, row } = getCandidatePlacement(anchor);
  if (!isValidPlacement(col, row)) return;

  for (const [dx, dy] of piece.cells) {
    boardState[row + dy][col + dx] = 1;
  }
}

function resetPieceToHome() {
  piece.anchor = { ...piece.home };
}

function startDrag(event) {
  const pointer = getPointerPosition(event);
  const localX = pointer.x - piece.anchor.x;
  const localY = pointer.y - piece.anchor.y;

  for (const [dx, dy] of piece.cells) {
    const x = dx * CELL;
    const y = dy * CELL;
    const inside = localX >= x && localX < x + CELL && localY >= y && localY < y + CELL;
    if (!inside) continue;

    drag.active = true;
    drag.pointerId = event.pointerId;
    drag.pointer = pointer;
    drag.grabOffset = { x: localX - x, y: localY - y };
    canvas.setPointerCapture(event.pointerId);
    return;
  }
}

function moveDrag(event) {
  if (!drag.active || event.pointerId !== drag.pointerId) return;
  drag.pointer = getPointerPosition(event);
}

function endDrag(event) {
  if (!drag.active || event.pointerId !== drag.pointerId) return;

  drag.pointer = getPointerPosition(event);
  tryPlacePiece();

  drag.active = false;
  drag.pointerId = null;
  drag.grabOffset = { x: 0, y: 0 };
  resetPieceToHome();

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoardGrid();
  drawTray();
  drawPlacementGhost();
  drawFloatingPiece();
}

function animate() {
  render();
  requestAnimationFrame(animate);
}

canvas.addEventListener('pointerdown', startDrag);
canvas.addEventListener('pointermove', moveDrag);
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('lostpointercapture', () => {
  if (!drag.active) return;
  drag.active = false;
  drag.pointerId = null;
  drag.grabOffset = { x: 0, y: 0 };
  resetPieceToHome();
});

animate();
