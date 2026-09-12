const ROLE_FAMILIES = [
  {
    id: "docs",
    label: "Technical Writer / Documentation",
    linkedin: '("technical writer" OR "documentation engineer" OR "information developer" OR "docs engineer") AND (DITA OR "docs as code" OR "API docs" OR MadCap)',
    include: [
      "technical writer", "documentation engineer", "information developer", "information development",
      "docs engineer", "technical publications", "documentation specialist",
      "technical communicator", "information architect"
    ],
    exclude: ["software engineer", "sales", "copywriter", "freelance writer", "recruiter", "data scientist"],
    signals: ["technical writer", "documentation", "dita", "oxygen xml", "acrolinx", "online help", "user manuals", "technical publications", "information developer", "docs-as-code", "docs as code", "api docs"]
  },
  {
    id: "swe",
    label: "Software Engineer",
    linkedin: "software engineer OR staff engineer OR backend engineer",
    include: ["software engineer", "software developer", "backend", "frontend", "full stack", "fullstack", "staff engineer", "sde"],
    exclude: ["technical writer", "recruiter", "sales"],
    signals: ["python", "java", "javascript", "react", "kubernetes", "microservices", "software engineer"]
  },
  {
    id: "data",
    label: "Data / Analytics",
    linkedin: "data analyst OR data scientist OR analytics engineer",
    include: ["data analyst", "data scientist", "analytics engineer", "machine learning", "ml engineer"],
    exclude: ["technical writer", "recruiter"],
    signals: ["sql", "tableau", "pandas", "data analyst", "data scientist", "power bi"]
  },
  {
    id: "pm",
    label: "Product Manager",
    linkedin: "product manager OR product owner",
    include: ["product manager", "product owner", "program manager"],
    exclude: ["technical writer", "software engineer"],
    signals: ["product manager", "roadmap", "stakeholder", "product owner"]
  },
  {
    id: "design",
    label: "Design / UX",
    linkedin: "ux designer OR product designer OR content designer",
    include: ["ux designer", "product designer", "ui designer", "content designer", "ux writer"],
    exclude: ["software engineer"],
    signals: ["figma", "ux", "user research", "wireframe", "content designer"]
  }
];

const GEO_ONLY = [
  "united states only", "us only", "usa only", "must reside in the us", "must be located in the us",
  "authorized to work in the united states", "uk only", "canada only", "eu only", "europe only",
  "australia only"
];

const US_REGION = [
  "united states", "usa", "u.s.a", "u.s.",
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut",
  "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa",
  "kansas", "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan",
  "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "new hampshire",
  "new jersey", "new mexico", "new york", "north carolina", "north dakota", "ohio", "oklahoma",
  "oregon", "pennsylvania", "rhode island", "south carolina", "south dakota", "tennessee",
  "texas", "utah", "vermont", "virginia", "washington", "west virginia", "wisconsin", "wyoming",
  "district of columbia", "washington dc"
];

const INDIA_REGION = [
  "india", "bengaluru", "bangalore", "hyderabad", "pune", "chennai", "mumbai", "delhi",
  "gurgaon", "gurugram", "noida", "kolkata", "ahmedabad", "karnataka", "telangana", "maharashtra"
];

const WORLDWIDE_REMOTE = [
  "work from anywhere", "worldwide", "anywhere in the world", "remote worldwide",
  "remote - worldwide", "remote, worldwide", "global remote"
];

const GREENHOUSE_BOARDS = [
  { token: "stripe", company: "Stripe" },
  { token: "cloudflare", company: "Cloudflare" },
  { token: "datadog", company: "Datadog" },
  { token: "mongodb", company: "MongoDB" },
  { token: "sentry", company: "Sentry" },
  { token: "twilio", company: "Twilio" },
  { token: "hashicorp", company: "HashiCorp" },
  { token: "grafana", company: "Grafana Labs" },
  { token: "elastic", company: "Elastic" },
  { token: "gitlab", company: "GitLab" }
];

function norm(s) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function suggestRoles(resumeText) {
  const text = norm(resumeText);
  if (!text) return [];
  return ROLE_FAMILIES.map((family) => {
    let score = 0;
    family.signals.forEach((sig) => {
      if (text.includes(sig)) score += sig.length > 12 ? 3 : 2;
    });
    return { ...family, score };
  }).filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function titleMatches(title, family) {
  const t = norm(title);
  if (!family.include.some((p) => t.includes(p))) return false;
  if (family.exclude.some((p) => t.includes(p))) return false;
  return true;
}

function locFlags(location) {
  const loc = norm(location);
  return {
    loc,
    us: US_REGION.some((p) => loc.includes(p)) || /\bus\b/.test(loc),
    uk: /\b(united kingdom|uk only|england)\b/.test(loc) || (loc.includes("london") && !loc.includes("ontario")),
    canada: loc.includes("canada") || loc.includes("ontario") || loc.includes("toronto") || loc.includes("vancouver"),
    eu: /\b(eu only|europe only|european union)\b/.test(loc),
    india: INDIA_REGION.some((p) => loc.includes(p)),
    worldwide: WORLDWIDE_REMOTE.some((p) => loc.includes(p)),
    remoteWord: /\bremote\b|distributed|work from home/.test(loc),
    geoPhrase: GEO_ONLY.some((p) => loc.includes(p))
  };
}

function isCountryLocked(f) {
  return f.geoPhrase || f.us || f.uk || f.canada || f.eu;
}

function locationMatches(job, mode) {
  const f = locFlags(job.location);
  if (mode === "anywhere") return true;
  if (mode === "bengaluru") {
    return ["bengaluru", "bangalore", "karnataka"].some((p) => f.loc.includes(p));
  }
  if (mode === "india") {
    if (f.india) return true;
    if (f.worldwide && !isCountryLocked(f)) return true;
    return false;
  }
  // remote-world = work from anywhere, not "remote in the US"
  if (f.worldwide && !isCountryLocked(f)) return true;
  if (f.remoteWord && !isCountryLocked(f) && !f.india) return true;
  return false;
}

function linkedinSearch(keywords, location, remote) {
  const params = new URLSearchParams({
    keywords,
    location: location || "Worldwide"
  });
  if (remote) params.set("f_WT", "2");
  params.set("f_TPR", "r604800");
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

function filterJobs(jobs, families, locationMode) {
  const active = families.length ? families : ROLE_FAMILIES;
  return jobs
    .filter((job) =>
      active.some((f) => titleMatches(job.title, f)) && locationMatches(job, locationMode)
    )
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || "") || a.title.localeCompare(b.title));
}

function mapRemoteOk(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((r) => r && r.position && (r.url || r.apply_url))
    .map((r) => ({
      title: r.position,
      company: r.company || "",
      url: r.url || r.apply_url,
      location: r.location || "Remote",
      salary_text: String(r.salary_max || r.salary_min || ""),
      source: "RemoteOK",
      updated_at: r.date ? new Date(Number(r.date) * 1000).toISOString() : ""
    }));
}

function mapGreenhouse(payload, company) {
  const jobs = (payload && payload.jobs) || [];
  return jobs.map((j) => ({
    title: j.title || "",
    company: company,
    url: j.absolute_url || j.url || "",
    location: (j.location && j.location.name) || "Not listed",
    salary_text: "",
    source: "Greenhouse",
    updated_at: j.updated_at || j.first_published || ""
  })).filter((j) => j.title && j.url);
}

async function fetchLiveJobs(onStatus) {
  const jobs = [];
  const note = (msg) => { if (onStatus) onStatus(msg); };

  try {
    note("Checking RemoteOK…");
    const live = await fetch("https://remoteok.com/api");
    if (live.ok) {
      jobs.push(...mapRemoteOk(await live.json()));
    }
  } catch (e) {
    note("RemoteOK blocked in this browser — LinkedIn search still works.");
  }

  note("Checking public Greenhouse career boards…");
  const boardResults = await Promise.allSettled(
    GREENHOUSE_BOARDS.map(async (board) => {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs`);
      if (!res.ok) throw new Error(board.token);
      return mapGreenhouse(await res.json(), board.company);
    })
  );
  boardResults.forEach((result, i) => {
    if (result.status === "fulfilled") jobs.push(...result.value);
  });

  const seen = new Set();
  return jobs.filter((j) => {
    if (!j.url || seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });
}

window.JobwatchApp = {
  ROLE_FAMILIES,
  suggestRoles,
  filterJobs,
  linkedinSearch,
  titleMatches,
  locationMatches,
  fetchLiveJobs
};
