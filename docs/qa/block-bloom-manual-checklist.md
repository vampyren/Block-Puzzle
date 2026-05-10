# Block Bloom Manual QA Checklist

Use this checklist to validate core gameplay behavior after updates.

## Preconditions

1. Launch latest build from a clean app start.
2. Start a **new game** (not resumed).
3. Keep board and hand area fully visible.
4. Run checks at least once on desktop width and once on a narrow/mobile-width viewport (if supported).

---

## 1) 8x8 board

### Reproducible setup
1. Start a new game.
2. Count visible grid cells left-to-right.
3. Count visible grid cells top-to-bottom.

### Exact pass criteria
- Horizontal count is exactly **8**.
- Vertical count is exactly **8**.
- Total playable cells are **64**.

---

## 2) Three-piece hand

### Reproducible setup
1. Start a new game.
2. Count pieces currently shown in hand/tray.
3. Place one piece legally; recount.
4. Place remaining two pieces legally; observe refresh.

### Exact pass criteria
- Hand shows exactly **3** pieces before any placement.
- Hand shows **2**, then **1**, then **0** as pieces are consumed.
- A fresh hand of exactly **3** pieces appears only after all 3 prior pieces are used.

---

## 3) Valid drag/drop

### Reproducible setup
1. Drag a hand piece to a legal empty footprint and release.
2. Drag a hand piece onto an occupied/invalid footprint and release.
3. Drag a hand piece partially out of board bounds and release.

### Exact pass criteria
- Legal drop: piece is placed; board occupancy increases by the piece cell count.
- Invalid or out-of-bounds drop: piece is not placed; board occupancy is unchanged; piece returns to hand.
- No duplicate/ghost blocks are left behind after failed drops.

---

## 4) Grouped vertical drop animation

### Reproducible setup
1. Place a multi-cell piece (3+ cells).
2. Observe landing animation frame-by-frame (screen recording at 60fps recommended).
3. Repeat 3 times with different piece shapes.

### Exact pass criteria
- Motion path is vertical only (no sideways drift while dropping).
- Cells of one placed piece animate as one synchronized group (same start/end window, no random stagger).
- Final resting positions match grid coordinates exactly.

---

## 5) Level speed differences (1..5)

### Reproducible setup
1. Set level/speed to **1**; place one comparable piece; time drop/resolve duration.
2. Repeat for levels **2**, **3**, **4**, **5** with comparable placements.
3. Record one timing per level.

### Exact pass criteria
- All levels **1, 2, 3, 4, 5** are selectable and functional.
- Resolve duration decreases monotonically with level (L1 > L2 > L3 > L4 > L5).
- Difference between L1 and L5 is visibly and measurably non-zero.

---

## 6) Row clear

### Reproducible setup
1. Fill a row so exactly one legal placement will complete it.
2. Place the required piece.
3. Wait for clear resolution.

### Exact pass criteria
- Completed row clears in a single clear event.
- All 8 cells in that row become empty after resolution.
- Score/clear feedback (if implemented) increments exactly once for that row.

---

## 7) Column clear

### Reproducible setup
1. Fill a column so exactly one legal placement will complete it.
2. Place the required piece.
3. Wait for clear resolution.

### Exact pass criteria
- Completed column clears in a single clear event.
- All 8 cells in that column become empty after resolution.
- Score/clear feedback (if implemented) increments exactly once for that column.

---

## 8) Particle effect on clear

### Reproducible setup
1. Trigger any row or column clear.
2. Observe clear moment closely (recording recommended).
3. Repeat 3 clears.

### Exact pass criteria
- A particle effect is emitted on each clear event.
- Effect starts at clear time (not before placement, not delayed to next turn).
- Effect origin overlaps cleared line cells.

---

## 9) No post-clear gravity

### Reproducible setup
1. Build a state with occupied cells above a row that will be cleared.
2. Clear that row.
3. Observe blocks that were above the cleared row.

### Exact pass criteria
- Non-cleared blocks keep their original row indices after clear.
- Empty spaces created by clear remain empty.
- No falling/collapse animation occurs after clear resolution.

---

## 10) Game over when none of three pieces can fit

### Reproducible setup
1. Reach a late-board state with irregular gaps.
2. Confirm hand contains exactly 3 pieces.
3. Attempt every legal drag target for each piece (and each rotation only if rotations exist in this build).

### Exact pass criteria
- If none of the 3 pieces has any legal placement, game enters game-over state immediately.
- Game-over trigger does not require consuming a piece first.
- Further board placements are blocked until restart/new game action.

---

## Evidence to capture (recommended)

- Screenshot/clip per checklist item.
- Timing table for level-speed check (L1..L5).
- Final board + hand screenshot for game-over proof.
