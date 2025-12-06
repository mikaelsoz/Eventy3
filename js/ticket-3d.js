
// 3D Golden Ticket - Eventy3
// Implements a 3D golden ticket that follows the mouse cursor

document.addEventListener('DOMContentLoaded', () => {
    initTicket();
});

function initTicket() {
    const container = document.getElementById('ticket-container');
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 20;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.5;
    container.appendChild(renderer.domElement);

    // --- GEOMETRY & MATERIAL ---

    // Create Texture for the Ticket
    function createTicketTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Background (Gold Gradient)
        const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
        gradient.addColorStop(0, '#FFED00');
        gradient.addColorStop(0.3, '#FDB931'); // Darker gold
        gradient.addColorStop(0.6, '#FFED00');
        gradient.addColorStop(1, '#C4A006');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Noise/Texture overlay for realism
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for (let i = 0; i < 5000; i++) {
            ctx.fillRect(Math.random() * 1024, Math.random() * 512, 2, 2);
        }

        // Border (Decorative)
        ctx.strokeStyle = '#664E0D';
        ctx.lineWidth = 15;
        ctx.strokeRect(30, 30, 964, 452);

        // Inner Border (Dashed)
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 4;
        ctx.setLineDash([15, 15]);
        ctx.strokeRect(50, 50, 924, 412);
        ctx.setLineDash([]);

        // Main Text: EVENTY3
        ctx.fillStyle = '#664E0D';
        ctx.font = '900 160px "Arial Black", Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Text Shadow/Emboss effect
        ctx.shadowColor = 'rgba(255,255,255,0.4)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText('EVENTY3', 512, 220);

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Subtext removed for cleaner look

        // Decorative Stars
        function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            let step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fillStyle = '#664E0D';
            ctx.fill();
        }

        drawStar(200, 256, 5, 40, 20);
        drawStar(824, 256, 5, 40, 20);

        // Stub Line (Perforation) - Vertical line on the right side
        ctx.beginPath();
        ctx.moveTo(880, 0);
        ctx.lineTo(880, 512);
        ctx.strokeStyle = 'rgba(102, 78, 13, 0.4)';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.stroke();

        // Barcode removed for cleaner look

        return new THREE.CanvasTexture(canvas);
    }

    const ticketTexture = createTicketTexture();
    ticketTexture.wrapS = THREE.ClampToEdgeWrapping;
    ticketTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Geometry: Extruded Shape with Rounded Corners and Notches
    function createTicketGeometry() {
        const width = 12;
        const height = 6;
        const radius = 0.5; // Corner radius
        const notchRadius = 0.8; // Side notch radius

        const shape = new THREE.Shape();

        // Start from top-left corner (after radius)
        shape.moveTo(-width / 2 + radius, height / 2);

        // Top edge
        shape.lineTo(width / 2 - radius, height / 2);
        shape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius);

        // Right edge with notch
        shape.lineTo(width / 2, notchRadius);
        // Notch: Center at (width/2, 0), Radius notchRadius. 
        // Arc from PI/2 (top) to -PI/2 (bottom) Counter-Clockwise (traces left side of circle, inwards)
        shape.absarc(width / 2, 0, notchRadius, Math.PI / 2, -Math.PI / 2, false);
        shape.lineTo(width / 2, -height / 2 + radius);

        // Bottom right corner
        shape.quadraticCurveTo(width / 2, -height / 2, width / 2 - radius, -height / 2);

        // Bottom edge
        shape.lineTo(-width / 2 + radius, -height / 2);
        shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2, -height / 2 + radius);

        // Left edge with notch
        shape.lineTo(-width / 2, -notchRadius);
        // Notch: Center at (-width/2, 0).
        // Arc from -PI/2 (bottom) to PI/2 (top) Counter-Clockwise (traces right side of circle, inwards)
        shape.absarc(-width / 2, 0, notchRadius, -Math.PI / 2, Math.PI / 2, false);
        shape.lineTo(-width / 2, height / 2 - radius);

        // Top left corner
        shape.quadraticCurveTo(-width / 2, height / 2, -width / 2 + radius, height / 2);

        const extrudeSettings = {
            steps: 2,
            depth: 0.2, // Thickness
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 3
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Fix UV mapping for the front and back faces
        // We need to map the shape coordinates (approx -6 to 6 in X, -3 to 3 in Y) to 0-1 UV space
        const posAttribute = geometry.attributes.position;
        const uvAttribute = geometry.attributes.uv;
        const count = posAttribute.count;

        for (let i = 0; i < count; i++) {
            const x = posAttribute.getX(i);
            const y = posAttribute.getY(i);
            const z = posAttribute.getZ(i);

            // Map x from [-width/2, width/2] to [0, 1]
            // Map y from [-height/2, height/2] to [0, 1]
            const u = (x + width / 2) / width;
            const v = (y + height / 2) / height;

            uvAttribute.setXY(i, u, v);
        }

        geometry.center(); // Center the geometry
        return geometry;
    }

    const geometry = createTicketGeometry();

    // Materials
    const faceMaterial = new THREE.MeshStandardMaterial({
        map: ticketTexture,
        roughness: 0.4,
        metalness: 0.6,
        bumpMap: ticketTexture,
        bumpScale: 0.02
    });

    const sideMaterial = new THREE.MeshStandardMaterial({
        color: 0xC4A006,
        roughness: 0.3,
        metalness: 0.8
    });

    const ticket = new THREE.Mesh(geometry, [faceMaterial, sideMaterial]);
    scene.add(ticket);

    // --- LIGHTING ---

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(10, 10, 20);
    scene.add(pointLight);

    const goldLight = new THREE.PointLight(0xFFED00, 1);
    goldLight.position.set(-10, -10, 10);
    scene.add(goldLight);

    // --- MOUSE INTERACTION ---

    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const windowHalfX = container.clientWidth / 2;
    const windowHalfY = container.clientHeight / 2;

    document.addEventListener('mousemove', (event) => {
        // Calculate mouse position relative to container center
        // We use window coordinates but map them to the container's context roughly
        // Ideally we'd use container bounds, but global mouse is fine for this effect
        mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        mouseY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    // --- ANIMATION ---

    // --- ANIMATION LOOP OPTIMIZED ---
    let isAnimating = true;

    function animate() {
        if (!isAnimating) return;

        requestAnimationFrame(animate);

        // Smooth rotation towards mouse target
        targetRotationY = mouseX * 0.5;
        targetRotationX = mouseY * 0.5;

        ticket.rotation.y += (targetRotationY - ticket.rotation.y) * 0.1;
        ticket.rotation.x += (targetRotationX - ticket.rotation.x) * 0.1;

        ticket.position.y = Math.sin(Date.now() * 0.002) * 0.2;

        renderer.render(scene, camera);
    }

    // Intersection Observer to pause animation when not visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!isAnimating) {
                    isAnimating = true;
                    animate();
                }
            } else {
                isAnimating = false;
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container);

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
