import React, { useState, useRef } from 'react';
import { Music, Music2 } from 'lucide-react';

const MusicToggle = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const toggleMusic = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.log("Audio play blocked by browser"));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <button 
                onClick={toggleMusic}
                className={`p-4 rounded-full shadow-2xl transition-all duration-500 group ${isPlaying ? 'bg-romantic-rose text-white animate-spin-slow' : 'bg-white/40 text-romantic-rose hover:bg-white/60'}`}
            >
                {isPlaying ? <Music size={24} /> : <Music2 size={24} />}
                
                {/* Tooltip */}
                <span className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {isPlaying ? 'Pause Romantic Music' : 'Play Romantic Music'}
                </span>
            </button>
            <audio 
                ref={audioRef}
                src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
                loop
            />
        </div>
    );
};

export default MusicToggle;
