import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Download } from 'lucide-react';

const Gallery = ({ memories }) => {
    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'vida-memory';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
            {memories.map((memory, index) => (
                <motion.div
                    key={memory._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative rounded-2xl overflow-hidden aspect-square shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                    <img 
                        src={memory.imageUrl} 
                        alt={memory.caption} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <p className="text-white font-medium text-lg mb-1">{memory.caption}</p>
                        <p className="text-pink-200 text-sm">{new Date(memory.eventDate || memory.date).toLocaleDateString()}</p>
                        
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button 
                                onClick={() => handleDownload(memory.imageUrl, memory.caption)}
                                className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-white/40"
                                title="Download Memory"
                            >
                                <Download size={20} className="text-white" />
                            </button>
                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <Heart className="text-white fill-romantic-red border-none" size={20} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default Gallery;
