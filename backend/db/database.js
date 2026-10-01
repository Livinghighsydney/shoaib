const Database = require('better-sqlite3');
const path = require('path');

// DB_PATH env var → Railway Volume path (e.g. /data/portfolio.db)
// Falls back to local file during development
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'portfolio.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const initialContent = {
  nav: {
    logo: 'Shoaib Zafar',
    tagline: 'PhD · Engineer · Researcher',
    links: [
      { label: 'Home',       href: '#home'       },
      { label: 'About',      href: '#about'      },
      { label: 'Services',   href: '#services'   },
      { label: 'Experience', href: '#experience' },
      { label: 'Portfolio',  href: '#projects'   },
    ],
  },

  hero: {
    greeting: 'PhD Researcher · Engineer · Consultant',
    titleLine1: 'RESEARCH',
    titleLine2: 'ENGINEER',
    description: 'Functional Safety · Industrial IoT · AI-Driven Resilience for Cyber-Physical Systems. Bridging rigorous academic research with real-world engineering impact. Open to postdoc, research, and consulting roles.',
    cta1: 'Download CV',
    cta2: 'View LinkedIn',
    cta1Link: '/uploads/CV-SHoaib.pdf',
    cta2Link: 'https://www.linkedin.com/in/shoaib-zafar-10a2a6ba/',
    photo: '/uploads/personal-nobg.png',
  },

  about: {
    heading: 'Discover the Story, Passion, and Purpose Behind the Things You See Here',
    description: "I am a PhD researcher and engineer with over a decade of experience spanning industrial automation, intelligent transportation systems, and cutting-edge academic research. My journey began in Pakistan commissioning Siemens PLC systems on food-processing lines, took me to China for a fully-funded Masters at Harbin Institute of Technology, and then to Scuola Superiore Sant'Anna in Italy — where I developed the first analytical framework for functional-safety communication using the openSAFETY protocol. A visiting research position in Greece followed, focusing on AI-driven DoS resilience in safety-critical industrial networks. I combine deep research expertise with real-world engineering to deliver impactful solutions in Industrial IoT, embedded systems, and AI for safety.",
    stats: [
      { value: '10+', label: 'Years of Experience' },
      { value: '4',   label: 'Research Publications' },
    ],
    images: [],
    cards: [
      { id: 1, emoji: '🎓', title: 'PhD Researcher',  subtitle: 'Scuola Superiore Sant\'Anna, Pisa' },
      { id: 2, emoji: '🏆', title: 'Award Winner',    subtitle: 'Outstanding Employee 2018'         },
      { id: 3, emoji: '📄', title: '4 Publications',  subtitle: 'Elsevier, IEEE, MDPI'              },
      { id: 4, emoji: '🌍', title: 'International',   subtitle: 'Pakistan · China · Italy · Greece' },
    ],
  },

  crafted: {
    title: 'THE CRAFTED MIND THAT BUILDS',
    subtitle: 'THE FUTURE OF SAFE SYSTEMS',
    stats: [
      { value: '10+', label: 'Years of Experience'  },
      { value: '4',   label: 'Research Publications' },
      { value: '4',   label: 'Countries Worked In'  },
    ],
  },

  techStack: {
    heading: 'A Curated Set of Tools and Technologies',
    subheading: 'Spanning Research, Industry, and Academia',
    items: [
      { name: 'openSAFETY',  icon: 'shield'    },
      { name: 'Python',      icon: 'python'    },
      { name: 'C / C++',     icon: 'cpp'       },
      { name: 'Linux Kernel',icon: 'linux'     },
      { name: 'Raspberry Pi',icon: 'raspberry' },
      { name: 'Siemens PLC', icon: 'plc'       },
      { name: 'LSTM / AI',   icon: 'ai'        },
      { name: 'MATLAB',      icon: 'matlab'    },
      { name: 'pyCPA',       icon: 'default'   },
      { name: 'VS Code',     icon: 'vscode'    },
    ],
  },

  services: {
    heading: 'Presenting the Professional Services and Unique Value I Offer to Help You Achieve Your Goals',
    items: [
      {
        id: 1,
        title: 'Industrial Safety Consulting',
        description: 'Expert analysis and protocol configuration for functional-safety communication in Industrial CPS — openSAFETY, EtherCAT, Profinet. I help engineering teams build safer, more reliable industrial networks aligned with IEC 61508.',
        icon: 'shield',
      },
      {
        id: 2,
        title: 'Embedded Systems Engineering',
        description: 'End-to-end design of real-time embedded systems: Siemens S7 PLC automation, SIMATIC HMI integration, firmware development in C/C++, and timing analysis for safety-critical applications on bare-metal and RTOS platforms.',
        icon: 'cpu',
      },
      {
        id: 3,
        title: 'AI & Research Solutions',
        description: 'Lightweight AI models — LSTM, VAE, trust-based frameworks — for anomaly detection, DoS resilience, and predictive monitoring in safety-critical IoT environments. Deployable on edge devices and constrained embedded platforms.',
        icon: 'brain',
      },
    ],
  },

  experience: {
    heading: 'A Comprehensive Journey Through My Professional Experience',
    subheading: 'in Research & Engineering',
    items: [
      {
        id: 1, number: '01',
        role: 'Visiting Researcher',
        company: 'University of Western Macedonia — ITHACA Lab, Greece',
        period: 'Apr 2025 – Sep 2025',
        description: 'Designed and implemented a trust-based DoS resilience framework for the openSAFETY protocol, targeting stealthy delay-based and resource-degrading attacks in safety-critical industrial networks. Conducted real-time experiments on a physical testbed demonstrating reliable attack detection while preserving black-channel safety assumptions. Co-authored a peer-reviewed paper (under review, IEEE 2026).',
      },
      {
        id: 2, number: '02',
        role: 'PhD Researcher',
        company: "Scuola Superiore Sant'Anna, Pisa, Italy",
        period: 'Oct 2022 – Sep 2025',
        description: 'Investigated functional-safety communication in Industrial Cyber-Physical Systems focusing on the openSAFETY protocol over wired Ethernet and IEEE 802.11. Developed the first analytical framework for timing-parameter configuration, improving operational availability and safety assurance. Published in Elsevier Journal of Systems Architecture (2025) and IEEE WFCS (2026).',
      },
      {
        id: 3, number: '03',
        role: 'Engineering Lecturer',
        company: 'Lahore Garrison University, Pakistan',
        period: 'Oct 2021 – Oct 2022',
        description: 'Designed and delivered undergraduate courses in Real-Time Embedded Systems, Algorithms, Data Structures, and Operating Systems. Supervised final-year dissertations, led a research group of undergraduate assistants, and authored research publications alongside grant applications for external funding.',
      },
      {
        id: 4, number: '04',
        role: 'Intelligent Transportation Systems Engineer',
        company: 'China State Construction Engineering Corp — CSCEC-PKM Project',
        period: 'Oct 2017 – Aug 2019',
        description: 'Deployed and integrated ITS infrastructure on the 392 km Multan–Sukkur motorway: automatic incident detection, license plate recognition, weather monitoring, FM radio communication, and AI-based speed enforcement. Awarded Outstanding Pakistani Employee 2018 with a $1,000 cash prize for exceptional project performance.',
      },
      {
        id: 5, number: '05',
        role: 'Electrical & Automation Engineer',
        company: 'Volka Food International, Multan, Pakistan',
        period: 'May 2015 – Oct 2017',
        description: 'Designed, installed, and commissioned electrical and automation systems for high-speed industrial food-processing plants using Siemens S7-300/400 PLCs, SIMATIC HMI, and Bosch Rexroth servo drives. Developed custom embedded cards for real-time wrapper control and implemented PID-based automation to reduce operational interruptions.',
      },
    ],
  },

  projects: {
    heading: 'A Selection of Projects That Showcase Research & Engineering Excellence',
    items: [
      {
        id: 1,
        title: 'openSAFETY Protocol — Timing Analysis',
        description: 'Developed the first analytical framework for timing-parameter configuration in openSAFETY over Ethernet and IEEE 802.11. Validated through real-time experiments on a physical testbed. Published in Journal of Systems Architecture, Elsevier (2025).',
        tech: ['openSAFETY', 'C', 'Ethernet', 'IEEE 802.11'],
        image: null,
        link: 'https://doi.org/10.1016/j.sysarc.2025.103605',
      },
      {
        id: 2,
        title: 'AI-Based DoS Resilience Framework',
        description: 'Lightweight trust-based anomaly detection system targeting stealthy delay-based and resource-degrading DoS attacks in safety-critical industrial networks. Preserves black-channel openSAFETY assumptions while enabling real-time threat mitigation.',
        tech: ['LSTM', 'Python', 'openSAFETY', 'Trust Models'],
        image: null,
        link: 'https://ieeexplore.ieee.org/document/11511646',
      },
      {
        id: 3,
        title: 'CSCEC-PKM Intelligent Transportation System',
        description: "Deployed and integrated ITS infrastructure on Pakistan's 392 km Multan–Sukkur motorway: automatic incident detection, license plate recognition, weather monitoring, FM radio, and AI-based speed enforcement.",
        tech: ['AI', 'ITS', 'Embedded', 'Real-Time Systems'],
        image: null,
        link: 'https://csci.cscec.com/en/xwzx/xw/201911/2992228.html',
      },
      {
        id: 4,
        title: 'Digital Twin of Double Pendulum',
        description: 'Real-time digital twin of a nonlinear Cyber-Physical System using the Ptask library in C. Implements task-based design with real-time scheduling, shared state management, and graphical simulation rendering.',
        tech: ['C', 'Ptask', 'Real-Time', 'CPS'],
        image: null,
        link: '#',
      },
      {
        id: 5,
        title: 'Energy-Efficient Multiprocessor Scheduling',
        description: 'Proposed MODE and RaSAM algorithms integrating Dynamic Power Management and DVFS within a Global EDF scheduling framework for energy-efficient real-time multiprocessor systems. Masters dissertation at HIT (GPA 3.85/4).',
        tech: ['Python', 'pyCPA', 'C', 'DVFS'],
        image: null,
        link: '#',
      },
      {
        id: 6,
        title: 'Industrial Food Plant Automation',
        description: 'Full design, installation, and commissioning of automation for MOGUL jelly plants, candy lines, and bubble gum production using Siemens S7-300/400 and SIMATIC HMI — PID control, servo drives, and custom embedded wrapper-control cards.',
        tech: ['Siemens PLC', 'SIMATIC HMI', 'PID Control', 'Embedded C'],
        image: null,
        link: '#',
      },
    ],
  },

  testimonials: {
    items: [
      {
        id: 2,
        name: 'Giorgio Buttazzo',
        role: 'Full Professor, Sant\'Anna',
        content: 'A highly motivated and technically strong researcher with a rare ability to bridge rigorous academic analysis and real industrial constraints. A genuine pleasure to supervise.',
        photo: null,
        size: 360, color: '#b15d5d', fontSize: 14, posX: 14.33, posY: 34.72,
      },
      {
        id: 3,
        name: 'Dimitrios Pliatsios',
        role: 'Researcher, UWM ITHACA Lab',
        content: "Shoaib's trust-based DoS resilience work is both novel and practically deployable. His collaborative approach and depth of expertise made the joint research at ITHACA Lab genuinely productive.",
        photo: null,
        size: 340, color: '#a9582d', fontSize: 10, posX: 60.33, posY: 23,
      },
    ],
  },

  contact: {
    title: 'Get in Touch to Start a Collaboration',
    subtitle: 'Research · Consulting · Engineering',
    projectTypes: [
      'Research Collaboration',
      'Industrial IoT Consulting',
      'Embedded Systems',
      'AI & Safety Systems',
      'Academic Partnership',
    ],
  },

  footer: {
    quickLinks: [
      { label: 'Home',       href: '#home'       },
      { label: 'About',      href: '#about'      },
      { label: 'Services',   href: '#services'   },
      { label: 'Experience', href: '#experience' },
      { label: 'Portfolio',  href: '#projects'   },
    ],
    brandName: 'PhD · Engineer · Researcher',
    email: 'shoaib_zaffar_5@hotmail.com',
    marqueeText: 'FUNCTIONAL SAFETY · INDUSTRIAL IOT · EMBEDDED SYSTEMS · AI RESILIENCE · OPEN TO COLLABORATE · ',
    socialLinks: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shoaib-zafar-10a2a6ba/' },
      { label: 'GitHub',   href: 'https://github.com/shoaibzafar'                      },
      { label: 'ORCID',    href: 'https://orcid.org/0000-0002-0000-0000'               },
    ],
  },

  theme: {
    type: 'gradient',
    color: '#0a0a0a',
    gradientFrom: '#2e2e2e',
    gradientTo: '#3f0808',
    gradientDir: '135deg',
    accentColor: '#8B1A10',
    textColor: '#ffffff',
    bodyFont: 'Inter',
    displayFont: 'Bebas Neue',
  },
};

const insert = db.prepare('INSERT OR IGNORE INTO content (key, value) VALUES (?, ?)');
const insertMany = db.transaction((items) => {
  for (const [key, value] of items) {
    insert.run(key, JSON.stringify(value));
  }
});

insertMany(Object.entries(initialContent));

module.exports = db;
