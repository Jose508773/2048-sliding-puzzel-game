# 2048 Game Design Document

## 1. Game Board Structure
- The game board will be a 4x4 grid.
- Each cell in the grid can either be empty or contain a tile.

## 2. Tile Properties
- Each tile will have a numerical value (e.g., 2, 4, 8, ..., 2048).
- Each tile will have a position (row, column) on the grid.

## 3. Movement Logic
- Players can slide tiles in four directions: up, down, left, and right.
- When a slide occurs, all tiles move as far as possible in the chosen direction until they hit another tile or the edge of the grid.
- If two tiles with the same value collide during a slide, they merge into a single tile with double the value.
- A merged tile cannot merge again in the same move.
- After each valid move (a slide that results in at least one tile moving or merging), a new tile (either 2 or 4) appears in a random empty cell on the board.

## 4. Score Tracking
- The player's score starts at 0.
- Each time two tiles merge, the value of the new tile is added to the player's score.

## 5. Game Over Conditions
- The game ends when:
    - The board is full, and no more moves are possible (no empty cells, and no adjacent tiles with the same value).
    - The player reaches the 2048 tile (optional, can continue playing after reaching 2048).


