import React, { useEffect, useRef } from 'react';

const Background3D: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const shapes: Shape[] = [];
        const colors = ['#4f46e5', '#8b5cf6', '#ec4899', '#06b6d4']; // Indigo, Violet, Pink, Cyan

        class Shape {
            x: number;
            y: number;
            z: number;
            size: number;
            color: string;
            speedX: number;
            speedY: number;
            rotationX: number;
            rotationY: number;
            rotationSpeed: number;
            type: 'cube' | 'tetrahedron';

            constructor() {
                this.x = (Math.random() - 0.5) * width;
                this.y = (Math.random() - 0.5) * height;
                this.z = Math.random() * 1000 + 500; // Depth
                this.size = Math.random() * 30 + 20;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.speedX = (Math.random() - 0.5) * 2;
                this.speedY = (Math.random() - 0.5) * 2;
                this.rotationX = Math.random() * Math.PI * 2;
                this.rotationY = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
                this.type = Math.random() > 0.5 ? 'cube' : 'tetrahedron';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.rotationX += this.rotationSpeed;
                this.rotationY += this.rotationSpeed;

                // Bounce off "walls" (virtual boundaries)
                if (this.x < -width / 2 || this.x > width / 2) this.speedX *= -1;
                if (this.y < -height / 2 || this.y > height / 2) this.speedY *= -1;
            }

            project(x: number, y: number, z: number) {
                const scale = 1000 / (1000 + z);
                const px = x * scale + width / 2;
                const py = y * scale + height / 2;
                return { x: px, y: py, scale };
            }

            draw() {
                // Simple 3D projection logic
                // Vertices for a cube centered at 0,0,0
                const vertices = this.type === 'cube' ? [
                    { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
                    { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
                ] : [
                    // Tetrahedron
                    { x: 1, y: 1, z: 1 }, { x: -1, y: -1, z: 1 }, { x: -1, y: 1, z: -1 }, { x: 1, y: -1, z: -1 }
                ];

                // Rotate vertices
                const rotatedVertices = vertices.map(v => {
                    // Rotate Y
                    let x = v.x * Math.cos(this.rotationY) - v.z * Math.sin(this.rotationY);
                    let z = v.x * Math.sin(this.rotationY) + v.z * Math.cos(this.rotationY);
                    // Rotate X
                    let y = v.y * Math.cos(this.rotationX) - z * Math.sin(this.rotationX);
                    z = v.y * Math.sin(this.rotationX) + z * Math.cos(this.rotationX);

                    return { x: x * this.size + this.x, y: y * this.size + this.y, z: z + this.z };
                });

                // Draw edges
                ctx!.strokeStyle = this.color;
                ctx!.lineWidth = 2;
                ctx!.globalAlpha = 0.6;
                ctx!.beginPath();

                if (this.type === 'cube') {
                    const edges = [
                        [0, 1], [1, 2], [2, 3], [3, 0], // Front face
                        [4, 5], [5, 6], [6, 7], [7, 4], // Back face
                        [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
                    ];
                    edges.forEach(([i, j]) => {
                        const p1 = this.project(rotatedVertices[i].x, rotatedVertices[i].y, rotatedVertices[i].z);
                        const p2 = this.project(rotatedVertices[j].x, rotatedVertices[j].y, rotatedVertices[j].z);
                        ctx!.moveTo(p1.x, p1.y);
                        ctx!.lineTo(p2.x, p2.y);
                    });
                } else {
                    // Tetrahedron edges
                    const edges = [
                        [0, 1], [0, 2], [0, 3],
                        [1, 2], [1, 3], [2, 3]
                    ];
                    edges.forEach(([i, j]) => {
                        const p1 = this.project(rotatedVertices[i].x, rotatedVertices[i].y, rotatedVertices[i].z);
                        const p2 = this.project(rotatedVertices[j].x, rotatedVertices[j].y, rotatedVertices[j].z);
                        ctx!.moveTo(p1.x, p1.y);
                        ctx!.lineTo(p2.x, p2.y);
                    });
                }
                ctx!.stroke();

                // Add a glow effect
                ctx!.shadowBlur = 15;
                ctx!.shadowColor = this.color;
                ctx!.stroke();
                ctx!.shadowBlur = 0;
            }
        }

        // Initialize shapes
        for (let i = 0; i < 30; i++) {
            shapes.push(new Shape());
        }

        const animate = () => {
            // Theme-aware colors
            const isDark = document.documentElement.classList.contains('dark');

            ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc'; // Dark Slate vs Slate 50
            ctx.fillRect(0, 0, width, height);

            // Add a subtle gradient overlay
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
            if (isDark) {
                gradient.addColorStop(0, '#1e1b4b'); // Deep Indigo
                gradient.addColorStop(1, '#020617'); // Almost Black
            } else {
                gradient.addColorStop(0, '#e0e7ff'); // Light Indigo
                gradient.addColorStop(1, '#f1f5f9'); // Slate 100
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            shapes.forEach(shape => {
                shape.update();
                shape.draw();
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10"
        />
    );
};

export default Background3D;
