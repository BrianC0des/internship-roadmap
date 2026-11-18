import { CompanyProfile, ScheduleUpdateItem } from '../types/roadmap';

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    id: 'hennge',
    name: 'HENNGE K.K.',
    roleTitle: 'Global Internship Program (GIP) — Full-Stack',
    tagline: 'Changing the world through the liberation of technology.',
    founded: 'November 1996 (Listed on Tokyo Stock Exchange)',
    headquarters: 'Shibuya, Tokyo, Japan',
    corporateLanguage: 'English (official internal corporate language)',
    officialLinks: [
      { label: 'HENNGE GIP Portal', url: 'https://hennge.com/global/gip/' },
      { label: 'HENNGE Engineering Blog', url: 'https://medium.com/henngeblog' },
      { label: 'HENNGE Corporate Site', url: 'https://hennge.com/global/' },
    ],
    whatTheyDo: [
      'Flagship product is HENNGE One, a market-leading B2B Cloud Security / Identity-as-a-Service (IDaaS) platform in Japan.',
      'Helps enterprises securely adopt multi-SaaS tools (Microsoft 365, Google Workspace, Box, Salesforce).',
      'Core editions: Identity (SSO, access control, MFA), DLP (email/storage data loss prevention & auditing), and Cybersecurity (phishing simulation like Tadrill & threat defense).',
    ],
    yourJobAsIntern: {
      summary:
        'You join an international cohort in Tokyo to build and deploy a real full-stack web application end-to-end, work with cloud infrastructure (AWS), and experience HENNGE’s engineering workflow.',
      workHoursAndLocation:
        'On-site in Shibuya, Tokyo (Mon–Fri, 10:00 AM – 7:00 PM JST), typically 4–7 weeks depending on batch.',
      supportProvided: [
        'Round-trip flights, housing/accommodation support, and internship allowance/stipend.',
        'Visa/entry coordination and English-first onboarding with mentors from 20+ nationalities.',
        'Weekly tech sessions, beer bashes, and company engineering events.',
      ],
      whatTheyLookFor: [
        'Clean, well-structured full-stack code in Python or Go + React/TypeScript.',
        'Comfort with Linux/Unix, Git, and at least 3 electives (AWS, full-stack, distributed systems, CI/CD or IaC, Docker).',
        'Genuine interest in open source and building a career in Japan.',
      ],
    },
    techStack: [
      { category: 'Backend', items: ['Python', 'Go', 'REST APIs'] },
      { category: 'Frontend', items: ['TypeScript', 'React'] },
      { category: 'Cloud & Infra', items: ['AWS (EC2, S3, RDS, IAM, Lambda)', 'Docker', 'Terraform / IaC', 'GitHub Actions'] },
      { category: 'OS & Workflow', items: ['Linux / Unix', 'Git / GitHub', 'CI/CD'] },
    ],
    cultureAndValues: [
      {
        title: 'Eat Unripe Fruits',
        detail:
          '“To remain early adopters, we eat unripe fruits. Make mistakes early.” Strong appetite for trying new tech.',
      },
      {
        title: 'English-First & Global',
        detail:
          'English is the official company language; engineers come from 20+ countries with flat, open communication.',
      },
      {
        title: 'Engineering-Led',
        detail:
          'CEO has an engineering background; teams are autonomous and host regular tech talks and Gasshuku off-sites.',
      },
    ],
    articlesAndBlogs: [
      {
        title: 'Krizza Bullecer’s Journey from Mindanao to HENNGE Tokyo',
        author: 'HENNGE Editorial (GIP 2022 Alumni)',
        category: 'Alumni & Recruiting',
        url: 'https://hennge.com/global/info/henka/',
        summary:
          'How an IT student from Zamboanga del Sur self-taught modern web tooling, passed the GIP coding challenge, and converted to full-time front-end engineer.',
      },
      {
        title: 'My experience as a GIP Intern 2023',
        author: 'Henry Helm (henngeblog)',
        category: 'Intern Experience',
        url: 'https://medium.com/henngeblog/my-experience-as-a-gip-intern-2023-2bb0a3d7ffb7',
        summary:
          'Firsthand breakdown of the full-stack sandbox projects, AWS deployment, 1-on-1 mentorship, and Shibuya office life.',
      },
      {
        title: 'One Step At A Time: My HENNGE GIP Experience',
        author: 'Brad McGlynn (henngeblog)',
        category: 'Intern Experience',
        url: 'https://medium.com/henngeblog/one-step-at-a-time-my-hennge-gip-experience-9cd76bbc8a1c',
        summary:
          'Day-to-day life in Tokyo, Bukatsu clubs, weekend trips, and how the internship works as an international student.',
      },
      {
        title: 'My Experience in GIP HENNGE',
        author: 'Past GIP Intern (henngeblog)',
        category: 'Intern Experience',
        url: 'https://medium.com/henngeblog/my-experience-in-gip-hennge-7cc8942d70fb',
        summary:
          'Reflections on the untimed coding challenge, interviews, and working with engineers from 20+ countries.',
      },
      {
        title: 'HENNGE GIP Official Info Session & SpeakerDeck',
        author: 'GIP Steering Committee',
        category: 'Employee & Engineering',
        url: 'https://speakerdeck.com/hennge',
        summary:
          'Official slides on subsidy, visa support, Shibuya office culture, and post-internship full-time conversion.',
      },
    ],
    hiringSchedule: {
      model: 'Rolling / First-Come, First-Served across 4 annual batches',
      closingPattern:
        'No fixed calendar deadline. Slots fill up quickly and can close up to ~4 months before a batch starts (or earlier once full). Apply as soon as your target batch opens.',
      typicalBatches: [
        {
          label: 'Batch 1 (Winter)',
          window: 'Mid-Jan – Mid-Feb',
          duration: '~5 weeks',
          notes: 'Often closes around September–October of the prior year.',
        },
        {
          label: 'Batch 2 (Early Summer)',
          window: 'Early Jun – Mid-Jul',
          duration: '~7 weeks',
          notes: 'Popular with international summer breaks; apply by Jan–Feb.',
        },
        {
          label: 'Batch 3 (Late Summer)',
          window: 'Early Aug – Early Sep',
          duration: '~5 weeks',
          notes: 'High demand; aim to submit coding challenge by March–April.',
        },
        {
          label: 'Batch 4 (Autumn)',
          window: 'October',
          duration: '~4–5 weeks',
          notes: 'Typically closes by June.',
        },
      ],
      selectionSteps: [
        {
          step: '1. Portal Registration',
          detail: 'Create an account on the HENNGE GIP portal and verify email.',
        },
        {
          step: '2. Untimed Coding Challenge',
          detail:
            'Complete the online coding challenge (no timer; speed is not graded—code clarity, correctness, and spec adherence matter).',
        },
        {
          step: '3. CV, Cover Letter & Batch Selection',
          detail:
            'Submit your 1-page CV, motivation letter, and preferred batches alongside your challenge solution.',
        },
        {
          step: '4. HR + Technical/Behavioral Interviews',
          detail:
            'Online HR screening followed by technical & behavioral interviews discussing your challenge code, projects, and Japan motivation.',
        },
      ],
      actionableTips: [
        'Since you are currently in 2nd year and HENNGE requires 3rd-year+ status by the internship start, target Batch 2/3 after your 2nd year or Batch 1 of 3rd year.',
        'Treat the untimed coding challenge like production code: clean README, edge-case handling, and clear tests.',
      ],
    },
  },
  {
    id: 'mercari',
    name: 'Mercari, Inc.',
    roleTitle: 'Software Engineer Intern (Backend / Frontend / Build@Mercari)',
    tagline: 'Go Bold. All for One. Be a Pro.',
    founded: 'February 2013 (Japan’s first unicorn)',
    headquarters: 'Roppongi Hills, Minato-ku, Tokyo, Japan',
    corporateLanguage: 'Bilingual (English & Japanese; B2+ English or Japanese accepted)',
    officialLinks: [
      { label: 'Mercari Engineering Blog', url: 'https://engineering.mercari.com/en/blog/' },
      { label: 'Mercari Careers', url: 'https://careers.mercari.com/' },
      { label: 'Mercan (Culture Blog)', url: 'https://mercan.mercari.com/en/' },
    ],
    whatTheyDo: [
      'Operates Japan’s largest C2C marketplace app (Mercari JP) with tens of millions of monthly active users.',
      'Expands across fintech and crypto via Merpay (mobile payments/credit) and Mercoin.',
      'Known globally in engineering for migrating from a monolith to a massive Go microservices architecture on GCP.',
    ],
    yourJobAsIntern: {
      summary:
        'Embedded directly inside a real product or platform engineering team for 2–3 months, shipping production features, writing automated tests, and participating in team PRs and code reviews.',
      workHoursAndLocation:
        'Roppongi office in Tokyo (or hybrid/remote within Japan), minimum ~20 hours/week for 2–3 months.',
      supportProvided: [
        'Full visa sponsorship, round-trip flights, and accommodation support for international interns.',
        'Dedicated mentor, team onboarding, and access to Mercari’s internal platform & AI tooling.',
        'Direct pathway to full-time New Grad Software Engineer offers upon strong performance.',
      ],
      whatTheyLookFor: [
        'Strong fundamentals in Go (or PHP/Java backend) or TypeScript/React frontend, plus SQL/RDBMS.',
        'Real product-building experience, automated testing habits, and clean Git team workflows.',
        'Demonstrated results using AI coding tools effectively, plus Linux, cloud, and OSS involvement.',
      ],
    },
    techStack: [
      { category: 'Backend', items: ['Go (primary)', 'PHP / Java (legacy/fintech)', 'Python (ML)', 'gRPC / Protobuf'] },
      { category: 'Frontend & Mobile', items: ['TypeScript', 'React / Next.js', 'Vue.js', 'Kotlin / Swift'] },
      { category: 'Cloud & Infra', items: ['GCP (primary)', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'Istio'] },
      { category: 'Data & Observability', items: ['Cloud Spanner', 'MySQL / PostgreSQL', 'Redis / Valkey', 'Datadog'] },
    ],
    cultureAndValues: [
      {
        title: 'Go Bold',
        detail:
          'Take calculated risks and ship fast; blameless postmortems treat failures as learning.',
      },
      {
        title: 'All for One',
        detail:
          'High cross-team collaboration across multicultural engineers in Tokyo, US, and India.',
      },
      {
        title: 'Be a Pro',
        detail:
          'High ownership from RFC design to testing, observability, and production reliability.',
      },
    ],
    articlesAndBlogs: [
      {
        title: 'Mercari Engineering Intern Experience (2025)',
        author: 'Mercari Engineering Blog',
        category: 'Intern Experience',
        url: 'https://engineering.mercari.com/en/blog/entry/20250128-15cddb7f50/',
        summary:
          'How engineering interns ship real consumer features, improve integration tests, and collaborate in fast-paced release cycles.',
      },
      {
        title: 'SRE Internship Experience at Mercari',
        author: 'Mercari SRE Intern',
        category: 'Intern Experience',
        url: 'https://engineering.mercari.com/en/blog/entry/20240129-sre-intern-blog/',
        summary:
          'Deep dive into cloud infrastructure, cost-effective log pipelines to BigQuery, and working alongside Mercari SREs.',
      },
      {
        title: 'Inside the Mercari Internship & Mentorship Program',
        author: 'Mercan (Official Mercari Blog)',
        category: 'Employee & Engineering',
        url: 'https://careers.mercari.com/en/mercan/articles/36747/',
        summary:
          'Stories from interns and mentors on onboarding, real production ownership, and final presentations in Tokyo.',
      },
      {
        title: 'Mercari Internship Experience & Interview Breakdown',
        author: 'Pratik (Dev.to)',
        category: 'Alumni & Recruiting',
        url: 'https://dev.to/kitarp29/mercari-internship-experience-2f90',
        summary:
          'Detailed walkthrough of HackerRank OA, project deep-dive interviews, and engineering manager rounds.',
      },
    ],
    hiringSchedule: {
      model: 'Multi-month cohort windows (New Grad / Intern tracks) + Build@Mercari',
      closingPattern:
        'Applications open months ahead for specific graduation cohorts (e.g. June–November windows for summer/new-grad pipelines), while Build@Mercari training tracks typically close around mid-January. End-to-end selection takes ~1–1.5 months.',
      typicalBatches: [
        {
          label: 'Build@Mercari (Training + Internship Track)',
          window: 'Applications ~Nov–Jan; Program ~Spring/Summer',
          duration: 'Training + 2-month internship',
          notes: 'Great entry point for underrepresented or early-career students; typically closes mid-January.',
        },
        {
          label: 'Summer / Autumn SWE Internship',
          window: 'Flexible 2–3 month start dates',
          duration: '2–3 months',
          notes: 'Recruiting windows often run June–November for upcoming grad cohorts.',
        },
      ],
      selectionSteps: [
        {
          step: '1. Resume & Motivation Screening',
          detail:
            'Submit CV, graduation timeline, GitHub/portfolio links, and why Mercari.',
        },
        {
          step: '2. Online Assessment (HackerRank)',
          detail:
            '2–3 timed coding problems. Evaluated not only on passing test cases, but also code cleanliness, naming, and edge cases.',
        },
        {
          step: '3. Technical Interview(s)',
          detail:
            'Live coding or technical deep-dive on data structures (arrays, maps, strings), API/system design, SQL, and past projects.',
        },
        {
          step: '4. Engineering Manager / Values Interview',
          detail:
            'Behavioral alignment with Go Bold, All for One, Be a Pro, plus product sense and AI-tool workflow stories.',
        },
      ],
      actionableTips: [
        'Document measurable results from using AI tools (e.g. faster test generation, refactoring with strict verification)—Mercari explicitly asks about this.',
        'Practice clean Go or TypeScript solutions on HackerRank with readable variable names and edge-case tests.',
      ],
    },
  },
];

export const INITIAL_COMPANY_UPDATES: ScheduleUpdateItem[] = [
  {
    id: 'upd-hennge-rolling',
    companyId: 'hennge',
    date: 'Recurring Pattern',
    title: 'HENNGE GIP uses rolling first-come, first-served batches',
    detail:
      '4 annual batches (Jan–Feb, Jun–Jul, Aug–Sep, Oct). Slots can close up to 4 months prior once filled.',
  },
  {
    id: 'upd-mercari-build',
    companyId: 'mercari',
    date: 'Recurring Pattern',
    title: 'Mercari SWE & Build@Mercari multi-month cycles',
    detail:
      'Build@Mercari typically closes mid-January; general SWE intern cohorts open across Jun–Nov for 2–3 month placements.',
  },
];
