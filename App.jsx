import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import './App.css'

const GRID_SIZE = 4
const INITIAL_TILES = 2

// Initialize empty grid
const createEmptyGrid = () => {
  return Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0))
}

// Get random empty cell
const getRandomEmptyCell = (grid) => {
  const emptyCells = []
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        emptyCells.push({ row, col })
      }
    }
  }
  return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null
}

// Add random tile (2 or 4)
const addRandomTile = (grid) => {
  const emptyCell = getRandomEmptyCell(grid)
  if (emptyCell) {
    const newGrid = grid.map(row => [...row])
    newGrid[emptyCell.row][emptyCell.col] = Math.random() < 0.9 ? 2 : 4
    return newGrid
  }
  return grid
}

// Initialize game with 2 random tiles
const initializeGame = () => {
  let grid = createEmptyGrid()
  grid = addRandomTile(grid)
  grid = addRandomTile(grid)
  return grid
}

// Move and merge logic for a single row
const moveRowLeft = (row) => {
  // Filter out zeros and move tiles left
  const filteredRow = row.filter(val => val !== 0)
  
  // Merge adjacent equal tiles
  const mergedRow = []
  let score = 0
  let i = 0
  
  while (i < filteredRow.length) {
    if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
      // Merge tiles
      const mergedValue = filteredRow[i] * 2
      mergedRow.push(mergedValue)
      score += mergedValue
      i += 2 // Skip next tile as it's been merged
    } else {
      mergedRow.push(filteredRow[i])
      i++
    }
  }
  
  // Fill remaining positions with zeros
  while (mergedRow.length < GRID_SIZE) {
    mergedRow.push(0)
  }
  
  return { row: mergedRow, score }
}

// Move grid in different directions
const moveGrid = (grid, direction) => {
  let newGrid = grid.map(row => [...row])
  let totalScore = 0
  let moved = false
  
  switch (direction) {
    case 'left':
      for (let row = 0; row < GRID_SIZE; row++) {
        const result = moveRowLeft(newGrid[row])
        if (JSON.stringify(result.row) !== JSON.stringify(newGrid[row])) {
          moved = true
        }
        newGrid[row] = result.row
        totalScore += result.score
      }
      break
      
    case 'right':
      for (let row = 0; row < GRID_SIZE; row++) {
        const reversedRow = [...newGrid[row]].reverse()
        const result = moveRowLeft(reversedRow)
        const finalRow = result.row.reverse()
        if (JSON.stringify(finalRow) !== JSON.stringify(newGrid[row])) {
          moved = true
        }
        newGrid[row] = finalRow
        totalScore += result.score
      }
      break
      
    case 'up':
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = []
        for (let row = 0; row < GRID_SIZE; row++) {
          column.push(newGrid[row][col])
        }
        const result = moveRowLeft(column)
        if (JSON.stringify(result.row) !== JSON.stringify(column)) {
          moved = true
        }
        for (let row = 0; row < GRID_SIZE; row++) {
          newGrid[row][col] = result.row[row]
        }
        totalScore += result.score
      }
      break
      
    case 'down':
      for (let col = 0; col < GRID_SIZE; col++) {
        const column = []
        for (let row = 0; row < GRID_SIZE; row++) {
          column.push(newGrid[row][col])
        }
        const reversedColumn = column.reverse()
        const result = moveRowLeft(reversedColumn)
        const finalColumn = result.row.reverse()
        if (JSON.stringify(finalColumn) !== JSON.stringify(column.reverse())) {
          moved = true
        }
        for (let row = 0; row < GRID_SIZE; row++) {
          newGrid[row][col] = finalColumn[row]
        }
        totalScore += result.score
      }
      break
  }
  
  return { grid: newGrid, score: totalScore, moved }
}

// Check if game is over
const isGameOver = (grid) => {
  // Check for empty cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) return false
    }
  }
  
  // Check for possible merges
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = grid[row][col]
      // Check right neighbor
      if (col < GRID_SIZE - 1 && grid[row][col + 1] === current) return false
      // Check bottom neighbor
      if (row < GRID_SIZE - 1 && grid[row + 1][col] === current) return false
    }
  }
  
  return true
}

// Check if player won (reached 2048)
const hasWon = (grid) => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 2048) return true
    }
  }
  return false
}

// Tile component
const Tile = ({ value, row, col, boardSize, isNew = false, isMerged = false }) => {
  if (value === 0) return null
  
  const getTileClass = (value) => {
    if (value <= 2048) {
      return `tile-${value}`
    }
    return 'tile-super'
  }
  
  // Calculate responsive tile size and position using CSS clamp values
  const padding = Math.max(4, Math.min(6, boardSize * 0.02)) // Responsive padding
  const availableSpace = boardSize - (padding * 2)
  const tileSize = Math.floor((availableSpace - (GRID_SIZE - 1) * 2) / GRID_SIZE)
  const tileSpacing = Math.floor((availableSpace - tileSize * GRID_SIZE) / (GRID_SIZE - 1))
  
  const left = padding + col * (tileSize + tileSpacing)
  const top = padding + row * (tileSize + tileSpacing)
  
  return (
    <div 
      className={`tile ${getTileClass(value)} ${isNew ? 'tile-new' : ''} ${isMerged ? 'tile-merge' : ''}`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${tileSize}px`,
        height: `${tileSize}px`,
      }}
    >
      {value}
    </div>
  )
}

// Game Board component
const GameBoard = ({ grid, newTiles = [], mergedTiles = [] }) => {
  const boardRef = useRef(null)
  const [boardSize, setBoardSize] = useState(320)
  
  useEffect(() => {
    const updateBoardSize = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect()
        setBoardSize(rect.width)
      }
    }
    
    updateBoardSize()
    window.addEventListener('resize', updateBoardSize)
    return () => window.removeEventListener('resize', updateBoardSize)
  }, [])
  
  // Calculate responsive grid cell size and position using CSS clamp values
  const padding = Math.max(4, Math.min(6, boardSize * 0.02)) // Responsive padding
  const availableSpace = boardSize - (padding * 2)
  const cellSize = Math.floor((availableSpace - (GRID_SIZE - 1) * 2) / GRID_SIZE)
  const cellSpacing = Math.floor((availableSpace - cellSize * GRID_SIZE) / (GRID_SIZE - 1))
  
  return (
    <div ref={boardRef} className="game-board">
      {/* Grid background */}
      {Array(GRID_SIZE).fill().map((_, row) =>
        Array(GRID_SIZE).fill().map((_, col) => {
          const left = padding + col * (cellSize + cellSpacing)
          const top = padding + row * (cellSize + cellSpacing)
          
          return (
            <div
              key={`grid-${row}-${col}`}
              className="grid-cell"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
            />
          )
        })
      )}
      
      {/* Tiles */}
      {grid.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const tileKey = `${rowIndex}-${colIndex}`
          const isNew = newTiles.includes(tileKey)
          const isMerged = mergedTiles.includes(tileKey)
          
          return (
            <Tile
              key={`${tileKey}-${value}`}
              value={value}
              row={rowIndex}
              col={colIndex}
              boardSize={boardSize}
              isNew={isNew}
              isMerged={isMerged}
            />
          )
        })
      )}
    </div>
  )
}

function App() {
  const [grid, setGrid] = useState(() => initializeGame())
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score')
    return saved ? parseInt(saved) : 0
  })
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [newTiles, setNewTiles] = useState([])
  const [mergedTiles, setMergedTiles] = useState([])
  
  const handleMove = useCallback((direction) => {
    if (gameOver) return
    
    const result = moveGrid(grid, direction)
    if (result.moved) {
      const newGrid = addRandomTile(result.grid)
      setGrid(newGrid)
      
      const newScore = score + result.score
      setScore(newScore)
      
      // Update best score
      if (newScore > bestScore) {
        setBestScore(newScore)
        localStorage.setItem('2048-best-score', newScore.toString())
      }
      
      // Find new tile position
      const newTilePositions = []
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (result.grid[row][col] === 0 && newGrid[row][col] !== 0) {
            newTilePositions.push(`${row}-${col}`)
          }
        }
      }
      setNewTiles(newTilePositions)
      
      // Clear animations after delay
      setTimeout(() => {
        setNewTiles([])
        setMergedTiles([])
      }, 200)
      
      if (hasWon(newGrid) && !won) {
        setWon(true)
      }
      
      if (isGameOver(newGrid)) {
        setGameOver(true)
      }
    }
  }, [grid, gameOver, won, score, bestScore])
  
  const handleKeyPress = useCallback((event) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        handleMove('left')
        break
      case 'ArrowRight':
        event.preventDefault()
        handleMove('right')
        break
      case 'ArrowUp':
        event.preventDefault()
        handleMove('up')
        break
      case 'ArrowDown':
        event.preventDefault()
        handleMove('down')
        break
    }
  }, [handleMove])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])
  
  const resetGame = () => {
    setGrid(initializeGame())
    setScore(0)
    setGameOver(false)
    setWon(false)
    setNewTiles([])
    setMergedTiles([])
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center game-container">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 tracking-tight">2048</h1>
        <p className="text-gray-600 mb-4 text-base md:text-lg">Join the numbers and get to the 2048 tile!</p>
        
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 flex-wrap">
          <div className="score-container">
            <div className="score-label">Score</div>
            <div className="score-value">{score.toLocaleString()}</div>
          </div>
          <div className="score-container">
            <div className="score-label">Best</div>
            <div className="score-value">{bestScore.toLocaleString()}</div>
          </div>
          <Button onClick={resetGame} className="game-button">
            New Game
          </Button>
        </div>
      </div>
      
      <GameBoard grid={grid} newTiles={newTiles} mergedTiles={mergedTiles} />
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-3 text-sm">Use arrow keys or buttons below to move tiles</p>
        <div className="control-buttons">
          <button onClick={() => handleMove('up')} className="control-button control-up">
            ↑
          </button>
          <button onClick={() => handleMove('left')} className="control-button control-left">
            ←
          </button>
          <button onClick={() => handleMove('down')} className="control-button control-down">
            ↓
          </button>
          <button onClick={() => handleMove('right')} className="control-button control-right">
            →
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-center text-xs md:text-sm text-gray-500 max-w-md px-4">
        <p><strong>HOW TO PLAY:</strong> Use your arrow keys to move the tiles. When two tiles with the same number touch, they merge into one!</p>
      </div>
      
      {won && (
        <div className="game-modal">
          <div className="modal-content">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-4">🎉 You Win!</h2>
            <p className="text-gray-600 mb-4 text-base md:text-lg">Congratulations! You reached the 2048 tile!</p>
            <p className="text-gray-500 mb-6">Final Score: <strong>{score.toLocaleString()}</strong></p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => setWon(false)} variant="outline" className="px-4 md:px-6">
                Keep Playing
              </Button>
              <Button onClick={resetGame} className="px-4 md:px-6">
                New Game
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {gameOver && (
        <div className="game-modal">
          <div className="modal-content">
            <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-4">😔 Game Over!</h2>
            <p className="text-gray-600 mb-4 text-base md:text-lg">No more moves available.</p>
            <p className="text-gray-500 mb-6">Final Score: <strong>{score.toLocaleString()}</strong></p>
            {score === bestScore && (
              <p className="text-yellow-600 font-semibold mb-4">🏆 New Best Score!</p>
            )}
            <Button onClick={resetGame} className="px-6 md:px-8">
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

