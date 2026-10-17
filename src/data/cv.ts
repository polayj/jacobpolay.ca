// Copied from public/Polay_Jacob_CV.pdf (September 2026). Publications and talks live in content collections.

export interface Education { degree: string; institution: string; dates: string; thesis?: string }
export interface Experience { title: string; org: string; dates: string; bullets: string[] }
export interface Award { name: string; org: string; year: string; amount: string }

export const cv = {
  education: [
    { degree: 'Doctor of Philosophy, History', institution: 'University of Saskatchewan', dates: 'September 2026 – present' },
    {
      degree: 'Master of Arts, History',
      institution: 'University of Saskatchewan',
      dates: 'September 2024 – June 2026',
      thesis: 'Loud Yet Invisible: A Humanist-Designed Pipeline for Unlocking the Early Modern Archive',
    },
    {
      degree: 'Bachelor of Arts, First Class Honours, History',
      institution: 'University of Calgary',
      dates: 'January 2020 – June 2024',
      thesis: "A Common Place: Place-making in Gerrard Winstanley's Vision of the English Commons",
    },
  ] as Education[],
  experience: [
    {
      title: 'Research Assistant',
      org: 'University of Saskatchewan',
      dates: 'September 2025 – present',
      bullets: [
        'Curated thematic reading lists across multiple historical fields.',
        'Transcribed and entered data from a historical township registry into structured Excel spreadsheets for analysis.',
      ],
    },
    {
      title: 'Teaching Assistant',
      org: 'University of Saskatchewan',
      dates: 'September 2024 – April 2025',
      bullets: [
        'Led weekly seminars, facilitating discussion and critical analysis of historical scholarship with students.',
        'Assessed written work and student participation, providing constructive feedback to support student development.',
        'Supported inclusive classroom environments and assisted with course administration.',
      ],
    },
    {
      title: 'IT and Data Manager',
      org: 'Rare Events',
      dates: 'July 2022 – present',
      bullets: [
        'Managed deployment and maintenance of large-scale digital payment systems under strict time constraints.',
        'Designed and maintained sales and inventory databases supporting events exceeding $400,000 in revenue.',
        'Supervised staff and coordinated rapid technical troubleshooting during live operations.',
      ],
    },
    {
      title: 'Research Assistant',
      org: 'Calgary Institute for the Humanities',
      dates: 'May 2022 – September 2022',
      bullets: [
        'Conducted archival research at the Glenbow Archives.',
        'Synthesized archival information into an analytical essay, assisting in the creation of an Energy History map of Alberta.',
      ],
    },
    {
      title: 'Museum Interpreter',
      org: 'East Coulee School Museum',
      dates: 'May 2021 – September 2021',
      bullets: [
        'Interpreted local and regional history for public audiences.',
        'Managed archival materials and cataloguing software.',
        'Contributed to exhibit development for display within the museum.',
      ],
    },
  ] as Experience[],
  awards: [
    { name: 'Ivo Lambi Memorial Scholarship in History', org: 'University of Saskatchewan', year: '2025', amount: '$1,000' },
    { name: 'Terrance L. Cameron Award', org: 'University of Saskatchewan', year: '2025', amount: '$3,500' },
    { name: 'Dr. Stephen J. Randall Prize in History', org: 'University of Calgary', year: '2024', amount: '$500' },
    { name: 'Wing Kin Wong and Lambert H.C. Wong Memorial Bursary', org: 'University of Calgary', year: '2023', amount: '$2,100' },
    { name: 'Jason Lang Scholarship', org: 'Government of Alberta', year: '2022, 2023', amount: '$1,000 each' },
  ] as Award[],
  service: [
    "Vice-Chair, History Graduate Students' Association (HGSA), University of Saskatchewan",
    "Founder, Footnotes on Film, a film-and-lecture series at Saskatoon's Broadway Theatre",
  ],
  methods: [
    'Archival transcription and data entry',
    'Optical character recognition (Transkribus, olmOCR, Tesseract)',
    'Named-entity recognition and text-as-data workflows',
    'Graph databases (Neo4j)',
    'Python for historical data processing',
    'Historical GIS (ArcGIS Pro)',
    'Large language models for historical analysis',
  ],
  languages: ['English: native fluency', 'Latin: reading knowledge (beginner)'],
  training: [
    'Graduate seminars in historiography, historical methods, and historical writing.',
    'Honours research seminars emphasizing independent archival research and writing, including intensive directed reading.',
    'Upper-level study in early modern England, Atlantic World history, and global urban history.',
    'Training in spatial and digital history, including undergraduate GIS coursework.',
  ],
  interests: [
    'Early Modern Atlantic World',
    'Commodity and Environmental History',
    'Digital History and Historical GIS',
    'Artificial Intelligence and Historical Methodology',
  ],
};
