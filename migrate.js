
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAVQZ86V13gPV_2xwjjigV7HreYwyE8SeU",
    authDomain: "robo-site-ioi.firebaseapp.com",
    projectId: "robo-site-ioi",
    storageBucket: "robo-site-ioi.firebasestorage.app",
    messagingSenderId: "372526346547",
    appId: "1:372526346547:web:20cca0597f3642e66d0e46",
    measurementId: "G-QLJ5X62L1T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const projects = [
    {
        title: 'Object detection using ML', category: 'Robotics',
        image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800',
        description: 'A 6-wheeled autonomous rover designed for traversing rough terrain and performing real-time soil analysis using onboard sensors.',
        year: '2025', status: 'active',
    },
    {
        title: 'Autonomous Drone Swarm', category: 'AI & Control',
        image: 'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&q=80&w=800',
        description: 'Coordinated flight algorithms enabling a swarm of 10 drones to map a 3D space collaboratively in real-time.',
        year: '2024', status: 'completed',
    },
    {
        title: 'Bipedal Walker', category: 'Mechanics',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
        description: 'Research into dynamic stability and biomechanical locomotion using a novel actuator design with active balance correction.',
        year: '2024', status: 'active',
    },
    {
        title: 'Smart Prosthetic Arm', category: 'Biomedical',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
        description: 'Low-cost myoelectric prosthetic arm with haptic feedback sensors and EMG signal processing.',
        year: '2023', status: 'completed',
    },
    {
        title: 'Line Following Bot', category: 'Robotics',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
        description: 'High-speed PID-controlled line follower robot that achieved 1st place in the inter-college competition.',
        year: '2025', status: 'completed',
    },
    {
        title: 'Robotic Arm Manipulator', category: 'AI & Control',
        image: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=800',
        description: '6-DOF robotic arm with inverse kinematics solver, capable of object sorting using computer vision.',
        year: '2025', status: 'active',
    },
];

const teamMembers = [
    {
        name: 'Ankit Bhalke', role: 'Team Lead',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
        bio: 'Leading the club towards innovation and excellence. Specializes in embedded systems and autonomous navigation.',
        socials: { linkedin: 'https://www.linkedin.com/in/ankit-bhalke', github: 'https://github.com/Ankitbhalke137' },
    },
    {
        name: 'Dhruv Teja', role: 'Mechanical Lead',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        bio: 'Focused on mechanical design, chassis development and CAD modelling with SolidWorks.',
        socials: { linkedin: '#' },
    },
    {
        name: 'Sai Shendge', role: 'AI/ML Lead',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        bio: 'Expert in sensor fusion, autonomous navigation and deep learning for robotic perception.',
        socials: { linkedin: '#' },
    },
    {
        name: 'Khushi Agarwal', role: 'Software Lead',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
        bio: 'Expert in ROS, computer vision, and full-stack robotics software architecture.',
        socials: { linkedin: '#', github: '#' },
    },
    {
        name: 'Arman Patel', role: 'Hardware Lead',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
        bio: 'PCB design wizard and electronics expert. Loves turning schematics into working boards.',
        socials: { linkedin: '#', github: '#' },
    },
];

const equipment = [
    {
        name: 'Arduino Uno R3', category: 'Microcontrollers',
        image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&q=80&w=600',
        description: 'The classic 8-bit ATmega328P board used for rapid prototyping, sensor interfacing and motor control projects.',
        qty: 8, status: 'available',
        specs: ['ATmega328P @ 16MHz', '32KB Flash', '14 Digital I/O', '6 PWM', '6 Analog Input'],
    },
    {
        name: 'Raspberry Pi 4 (4GB)', category: 'Single Board Computers',
        image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600',
        description: 'Linux-based SBC used for high-level robot control, ROS, computer vision pipelines and edge AI inference.',
        qty: 4, status: 'available',
        specs: ['Cortex-A72 Quad-core', '4GB LPDDR4', 'GPIO 40-pin', 'USB 3.0', 'Gigabit Ethernet'],
    },
    {
        name: 'HC-SR04 Ultrasonic Sensor', category: 'Sensors',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
        description: 'Industry-standard distance measurement sensor. Used in obstacle avoidance, mapping and proximity detection.',
        qty: 20, status: 'available',
        specs: ['Range: 2cm – 400cm', 'Accuracy: ±3mm', '5V Supply', 'Trigger/Echo Interface'],
    },
];

async function migrate() {
    console.log("Starting migration...");

    const collections = {
        'projects': projects,
        'team': teamMembers,
        'inventory': equipment
    };

    for (const [colName, data] of Object.entries(collections)) {
        console.log(`Migrating ${colName}...`);
        // Optional: Clear collection first if you want a clean start
        // const snapshot = await getDocs(collection(db, colName));
        // for (const docSnap of snapshot.docs) {
        //   await deleteDoc(doc(db, colName, docSnap.id));
        // }

        for (const item of data) {
            await addDoc(collection(db, colName), item);
            console.log(`  Added: ${item.title || item.name}`);
        }
    }

    console.log("Migration complete!");
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
