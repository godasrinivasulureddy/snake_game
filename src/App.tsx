import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw, 
  Music, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Settings,
  Gamepad2,
  Activity,
  Cpu,
  ChevronRight,
  Monitor,
  Zap,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
}

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';
const INITIAL_SPEED = 150;

const TRACKS: Track[] = [
  {
    id: 1,
    title: "AETHER_WAVE_01",
    artist: "Synthetic Horizons",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: 2,
    title: "SONIC_FLOW_BETA",
    artist: "Neural Drift",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },
  {
    id: 3,
    title: "NEON_PULSE_X",
    artist: "Cyber Core",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"
  }
];

// --- Components ---

const AetherSnake: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [isPaused, setIsPaused] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('aether-snake-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setIsPaused(false);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setSpeed(INITIAL_SPEED);
  };

  const moveSnake = useCallback(() => {
    if (isPaused || gameOver || !gameStarted) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('aether-snake-highscore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(prev - 3, 50)); 
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, gameStarted, generateFood, highScore]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, speed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (!gameStarted && (key === ' ' || key === 'enter')) {
        startGame();
        return;
      }

      switch (key) {
        case 'arrowup':
        case 'w':
          if (direction !== 'DOWN') setDirection('UP'); break;
        case 'arrowdown':
        case 's':
          if (direction !== 'UP') setDirection('DOWN'); break;
        case 'arrowleft':
        case 'a':
          if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'arrowright':
        case 'd':
          if (direction !== 'LEFT') setDirection('RIGHT'); break;
        case ' ':
          setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Stats Bar */}
      <div className="w-full glass rounded-2xl p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Gamepad2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Current Score</p>
            <p className="text-xl font-bold font-mono tracking-tighter">{score.toString().padStart(4, '0')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Best Record</p>
            <p className="text-xl font-bold font-mono tracking-tighter text-cyan-400">{highScore.toString().padStart(4, '0')}</p>
          </div>
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Trophy className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Game Arena */}
      <div className="relative glass rounded-3xl p-2 shadow-inner overflow-hidden aspect-square w-full max-w-[500px] border border-white/5">
        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 pointer-events-none opacity-10">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/20" />
          ))}
        </div>

        <div 
          className="grid w-full h-full gap-0"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnakeHead = snake[0].x === x && snake[0].y === y;
            const snakeIndex = snake.findIndex(s => s.x === x && s.y === y);
            const isSnakeBody = snakeIndex !== -1;
            const isFood = food.x === x && food.y === y;

            return (
              <div 
                key={i} 
                className="relative"
              >
                {isSnakeBody && (
                  <motion.div 
                    layoutId={`snake-${snakeIndex}`}
                    className={`absolute inset-0 rounded-[2px] shadow-lg ${
                      isSnakeHead 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 z-10' 
                        : 'bg-white/30'
                    }`}
                    style={{
                      opacity: isSnakeHead ? 1 : 1 - (snakeIndex / snake.length) * 0.6,
                      scale: isSnakeHead ? 1.1 : 0.9,
                    }}
                  />
                )}
                {isFood && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-[20%] bg-cyan-400 rounded-full food-pulse shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {!gameStarted && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-30 p-8 text-center"
            >
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-5xl font-black tracking-tighter uppercase italic text-blue-500">
                    Aether Snake
                  </h2>
                  <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase">High-Fidelity Protocol</p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  <div className="glass p-3 rounded-xl flex flex-col items-center space-y-2">
                    <div className="flex space-x-1">
                      <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">W</kbd>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">A</kbd>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">S</kbd>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">D</kbd>
                    </div>
                    <span className="text-[8px] uppercase font-bold text-white/30">Move</span>
                  </div>
                  <div className="glass p-3 rounded-xl flex flex-col items-center space-y-2">
                    <kbd className="px-4 py-1 bg-white/10 rounded text-[10px]">SPACE</kbd>
                    <span className="text-[8px] uppercase font-bold text-white/30">Pause</span>
                  </div>
                </div>

                <button 
                  onClick={startGame}
                  className="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-black text-lg transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/40 overflow-hidden"
                >
                  <span className="relative z-10 uppercase italic">Initialize Stream</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </div>
            </motion.div>
          )}

          {(isPaused || gameOver) && gameStarted && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 space-y-6"
            >
              <div className="text-center">
                <h2 className={`text-4xl font-black tracking-tighter uppercase italic ${gameOver ? 'text-red-500' : 'text-white'}`}>
                  {gameOver ? 'Simulation Terminated' : 'Paused'}
                </h2>
                {gameOver && (
                  <div className="mt-4 space-y-1">
                    <p className="text-white/60 text-sm font-mono">Final Score: {score}</p>
                    {score === highScore && score > 0 && (
                      <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">New High Record!</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={gameOver ? resetGame : () => setIsPaused(false)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-xl shadow-blue-500/20"
                >
                  {gameOver ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{gameOver ? 'Restart' : 'Resume'}</span>
                </button>
                {!gameOver && (
                  <button 
                    onClick={resetGame}
                    className="px-8 py-3 glass hover:bg-white/10 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Help */}
      <div className="flex items-center space-x-8 text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
        <div className="flex items-center space-x-2">
          <kbd className="px-2 py-1 glass rounded text-white/60">WASD / ARROWS</kbd>
          <span>Navigate</span>
        </div>
        <div className="flex items-center space-x-2">
          <kbd className="px-2 py-1 glass rounded text-white/60">SPACE</kbd>
          <span>Pause</span>
        </div>
      </div>
    </div>
  );
};

const SonicFlow: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && audioRef.current) {
        const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(p || 0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length);
    setProgress(0);
  };
  const prevTrack = () => {
    setCurrentTrackIndex(prev => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 p-4 z-50">
      <audio ref={audioRef} src={currentTrack.url} onEnded={nextTrack} />
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center space-x-4 w-1/3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold tracking-tight uppercase">{currentTrack.title}</p>
            <p className="text-xs text-white/40 font-medium uppercase tracking-widest">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-3 w-1/3">
          <div className="flex items-center space-x-6">
            <button onClick={prevTrack} className="text-white/40 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <button onClick={nextTrack} className="text-white/40 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          
          <div className="w-full flex items-center space-x-3">
            <span className="text-[10px] font-mono text-white/30">
              {audioRef.current ? Math.floor(audioRef.current.currentTime / 60) + ":" + Math.floor(audioRef.current.currentTime % 60).toString().padStart(2, '0') : "0:00"}
            </span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-blue-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/30">
              {audioRef.current && !isNaN(audioRef.current.duration) ? Math.floor(audioRef.current.duration / 60) + ":" + Math.floor(audioRef.current.duration % 60).toString().padStart(2, '0') : "3:45"}
            </span>
          </div>
        </div>

        {/* Volume / Extra */}
        <div className="flex items-center justify-end space-x-6 w-1/3">
          <div className="hidden md:flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-white/40" />
            <div className="w-20 h-1 bg-white/10 rounded-full">
              <div className="w-3/4 h-full bg-white/40 rounded-full" />
            </div>
          </div>
          <button className="text-white/40 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center pt-12 pb-32 relative">
      {/* Background Accents */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="mb-8 text-center space-y-2">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-blue-500" />
          <span className="text-[10px] font-bold tracking-[0.4em] text-blue-400 uppercase">System Active</span>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-blue-500" />
        </div>
        <h1 className="text-6xl font-black tracking-tighter italic uppercase">
          Aether<span className="text-blue-500">Snake</span>
        </h1>
        <p className="text-white/30 text-xs font-medium uppercase tracking-[0.2em]">High-Fidelity Arcade Protocol v5.0</p>
      </header>

      <main className="w-full flex-1">
        <AetherSnake />
      </main>

      <SonicFlow />

      {/* Footer Status */}
      <footer className="fixed bottom-24 left-8 hidden lg:block">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3 text-[10px] font-bold tracking-widest text-white/20">
            <Activity className="w-3 h-3 text-green-500" />
            <span>LATENCY: 12MS</span>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-bold tracking-widest text-white/20">
            <Cpu className="w-3 h-3 text-blue-500" />
            <span>CORE_LOAD: 14%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
