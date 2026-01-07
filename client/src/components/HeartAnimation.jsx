import React, { useEffect, useRef } from 'react';

const HeartAnimation = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const hearts = [];
        const heartCount = 35; // More hearts for premium feel

        class Heart {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 500;
                this.size = Math.random() * 20 + 8;
                this.speed = Math.random() * 0.8 + 0.3;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.angle = Math.random() * Math.PI * 2;
                this.color = Math.random() > 0.5 ? '#f472b6' : '#e11d48'; // Alternate between rose and red
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.globalAlpha = this.opacity;
                
                // Add a subtle glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
                
                ctx.fillStyle = this.color;
                
                ctx.beginPath();
                const d = this.size;
                ctx.moveTo(0, 0);
                // Better heart shape
                ctx.bezierCurveTo(-d / 2, -d / 2, -d, d / 3, 0, d);
                ctx.bezierCurveTo(d, d / 3, d / 2, -d / 2, 0, 0);
                ctx.fill();
                
                ctx.restore();
            }

            update() {
                this.y -= this.speed;
                this.x += Math.sin(this.angle) * 0.4;
                this.angle += 0.01;

                if (this.y < -100) {
                    this.reset();
                }
            }
        }

        for (let i = 0; i < heartCount; i++) {
            hearts.push(new Heart());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hearts.forEach((heart) => {
                heart.update();
                heart.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-1]" 
        />
    );
};

export default HeartAnimation;
