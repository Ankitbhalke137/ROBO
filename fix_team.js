import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAVQZ86V13gPV_2xwjjigV7HreYwyE8SeU",
    authDomain: "robo-site-ioi.firebaseapp.com",
    projectId: "robo-site-ioi"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

async function run() {
    console.log("Removing old team members...");
    const snap = await getDocs(collection(db, 'team'));
    for (const d of snap.docs) {
        await deleteDoc(doc(db, 'team', d.id));
    }
    console.log("Adding default team members...");
    for (const m of teamMembers) {
        await addDoc(collection(db, 'team'), m);
    }
    console.log("Done!");
    process.exit(0);
}
run();
