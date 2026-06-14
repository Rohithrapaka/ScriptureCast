/**
 * English-to-Telugu Bible book alias mapping.
 *
 * Every `id` matches the exact Telugu book ID returned by the API.
 * `aliases` are all lowercase — normalization is handled at lookup time.
 */

export interface BookEntry {
  id: string;          // exact Telugu ID from the dataset (used as book.id)
  teluguName: string;  // Telugu display name (same as id)
  englishName: string; // canonical English book name
  aliases: string[];   // English names / abbreviations (all lowercase, no spaces)
}

export const BIBLE_BOOKS: BookEntry[] = [
  // ── Old Testament ──────────────────────────────────────────────────────────
  { id: 'ఆదికాండము',               teluguName: 'ఆదికాండము',               englishName: 'Genesis',
    aliases: ['genesis','gen','ge','gn'] },
  { id: 'నిర్గమకాండము',             teluguName: 'నిర్గమకాండము',             englishName: 'Exodus',
    aliases: ['exodus','exo','ex','exd'] },
  { id: 'లేవీయకాండము',              teluguName: 'లేవీయకాండము',              englishName: 'Leviticus',
    aliases: ['leviticus','lev','le','lv'] },
  { id: 'సంఖ్యాకాండము',             teluguName: 'సంఖ్యాకాండము',             englishName: 'Numbers',
    aliases: ['numbers','num','nu','nb','nm'] },
  { id: 'ద్వితియోపదేశకాండము',       teluguName: 'ద్వితియోపదేశకాండము',       englishName: 'Deuteronomy',
    aliases: ['deuteronomy','deut','deu','dt','de'] },
  { id: 'యెహోషువ',                  teluguName: 'యెహోషువ',                  englishName: 'Joshua',
    aliases: ['joshua','josh','jos','jsh'] },
  { id: 'న్యాయాధిపతులు',            teluguName: 'న్యాయాధిపతులు',            englishName: 'Judges',
    aliases: ['judges','judg','jdg','jg','jud'] },
  { id: 'రూతు',                     teluguName: 'రూతు',                     englishName: 'Ruth',
    aliases: ['ruth','rut','ru'] },
  { id: '1సమూయేలు',                 teluguName: '1సమూయేలు',                 englishName: '1 Samuel',
    aliases: ['1samuel','1sam','1sa','1s','isamuel','isam'] },
  { id: '2సమూయేలు',                 teluguName: '2సమూయేలు',                 englishName: '2 Samuel',
    aliases: ['2samuel','2sam','2sa','2s','iisamuel','iisam'] },
  { id: '1రాజులు',                  teluguName: '1రాజులు',                  englishName: '1 Kings',
    aliases: ['1kings','1kgs','1ki','1k','ikings','ikgs'] },
  { id: '2రాజులు',                  teluguName: '2రాజులు',                  englishName: '2 Kings',
    aliases: ['2kings','2kgs','2ki','2k','iikings','iikgs'] },
  { id: '1దినవృత్తాంతములు',        teluguName: '1దినవృత్తాంతములు',        englishName: '1 Chronicles',
    aliases: ['1chronicles','1chron','1chr','1ch','ichronicles','ichr'] },
  { id: '2దినవృత్తాంతములు',        teluguName: '2దినవృత్తాంతములు',        englishName: '2 Chronicles',
    aliases: ['2chronicles','2chron','2chr','2ch','iichronicles','iichr'] },
  { id: 'ఎజ్రా',                    teluguName: 'ఎజ్రా',                    englishName: 'Ezra',
    aliases: ['ezra','ezr','ez'] },
  { id: 'నెహెమ్యా',                 teluguName: 'నెహెమ్యా',                 englishName: 'Nehemiah',
    aliases: ['nehemiah','neh','ne'] },
  { id: 'ఎస్తేరు',                  teluguName: 'ఎస్తేరు',                  englishName: 'Esther',
    aliases: ['esther','est','es','esth'] },
  { id: 'యోబు',                     teluguName: 'యోబు',                     englishName: 'Job',
    aliases: ['job','jb'] },
  { id: 'కీర్తనలు',                 teluguName: 'కీర్తనలు',                 englishName: 'Psalms',
    aliases: ['psalms','psalm','psa','ps','pss'] },
  { id: 'సామెతలు',                  teluguName: 'సామెతలు',                  englishName: 'Proverbs',
    aliases: ['proverbs','prov','pro','prv','pr'] },
  { id: 'ప్రసంగి',                  teluguName: 'ప్రసంగి',                  englishName: 'Ecclesiastes',
    aliases: ['ecclesiastes','eccles','eccl','ecc','ec','qoheleth','qoh'] },
  { id: 'పరమగీతము',                 teluguName: 'పరమగీతము',                 englishName: 'Song of Solomon',
    aliases: ['songofsolomon','song','songs','sos','sng','sol','ss','canticles','sg'] },
  { id: 'యెషయా',                    teluguName: 'యెషయా',                    englishName: 'Isaiah',
    aliases: ['isaiah','isa','is'] },
  { id: 'యిర్మియా',                 teluguName: 'యిర్మియా',                 englishName: 'Jeremiah',
    aliases: ['jeremiah','jer','je','jr'] },
  { id: 'విలాపవాక్యములు',           teluguName: 'విలాపవాక్యములు',           englishName: 'Lamentations',
    aliases: ['lamentations','lam','la'] },
  { id: 'యెహేజ్కేలు',               teluguName: 'యెహేజ్కేలు',               englishName: 'Ezekiel',
    aliases: ['ezekiel','ezek','eze','ezk'] },
  { id: 'దానియేలు',                 teluguName: 'దానియేలు',                 englishName: 'Daniel',
    aliases: ['daniel','dan','da','dn'] },
  { id: 'హోషేయా',                   teluguName: 'హోషేయా',                   englishName: 'Hosea',
    aliases: ['hosea','hos','ho'] },
  { id: 'యోవేలు',                   teluguName: 'యోవేలు',                   englishName: 'Joel',
    aliases: ['joel','joe','jl'] },
  { id: 'ఆమోసు',                    teluguName: 'ఆమోసు',                    englishName: 'Amos',
    aliases: ['amos','amo','am'] },
  { id: 'ఓబద్యా',                   teluguName: 'ఓబద్యా',                   englishName: 'Obadiah',
    aliases: ['obadiah','obad','oba','ob'] },
  { id: 'యోనా',                     teluguName: 'యోనా',                     englishName: 'Jonah',
    aliases: ['jonah','jon','jnh'] },
  { id: 'మీకా',                     teluguName: 'మీకా',                     englishName: 'Micah',
    aliases: ['micah','mic','mi'] },
  { id: 'నహూము',                    teluguName: 'నహూము',                    englishName: 'Nahum',
    aliases: ['nahum','nah','na'] },
  { id: 'హబక్కూకు',                 teluguName: 'హబక్కూకు',                 englishName: 'Habakkuk',
    aliases: ['habakkuk','hab','hb'] },
  { id: 'జెఫన్యా',                  teluguName: 'జెఫన్యా',                  englishName: 'Zephaniah',
    aliases: ['zephaniah','zeph','zep','zp'] },
  { id: 'హగ్గయి',                   teluguName: 'హగ్గయి',                   englishName: 'Haggai',
    aliases: ['haggai','hag','hg'] },
  { id: 'జెకర్యా',                  teluguName: 'జెకర్యా',                  englishName: 'Zechariah',
    aliases: ['zechariah','zech','zec','zc'] },
  { id: 'మలాకీ',                    teluguName: 'మలాకీ',                    englishName: 'Malachi',
    aliases: ['malachi','mal','ml'] },

  // ── New Testament ──────────────────────────────────────────────────────────
  { id: 'మత్తయి',                   teluguName: 'మత్తయి',                   englishName: 'Matthew',
    aliases: ['matthew','matt','mat','mt'] },
  { id: 'మార్కు',                   teluguName: 'మార్కు',                   englishName: 'Mark',
    aliases: ['mark','mrk','mk','mr'] },
  { id: 'లూకా',                     teluguName: 'లూకా',                     englishName: 'Luke',
    aliases: ['luke','luk','lk'] },
  { id: 'యోహాను',                   teluguName: 'యోహాను',                   englishName: 'John',
    aliases: ['john','joh','jhn','jn'] },
  { id: 'అపో.కార్యములు',            teluguName: 'అపో.కార్యములు',            englishName: 'Acts',
    aliases: ['acts','act','ac'] },
  { id: 'రోమీయులకు',                teluguName: 'రోమీయులకు',                englishName: 'Romans',
    aliases: ['romans','rom','ro','rm'] },
  { id: '1కోరింథీయులకు',            teluguName: '1కోరింథీయులకు',            englishName: '1 Corinthians',
    aliases: ['1corinthians','1cor','1co','1c','icorinthians','icor'] },
  { id: '2కోరింథీయులకు',            teluguName: '2కోరింథీయులకు',            englishName: '2 Corinthians',
    aliases: ['2corinthians','2cor','2co','2c','iicorinthians','iicor'] },
  { id: 'గలతియులకు',                teluguName: 'గలతియులకు',                englishName: 'Galatians',
    aliases: ['galatians','gal','ga'] },
  { id: 'ఎఫెసీయులకు',               teluguName: 'ఎఫెసీయులకు',               englishName: 'Ephesians',
    aliases: ['ephesians','eph','ep'] },
  { id: 'ఫిలిప్పీయులకు',             teluguName: 'ఫిలిప్పీయులకు',             englishName: 'Philippians',
    aliases: ['philippians','phil','php','ph'] },
  { id: 'కొలస్సీయులకు',             teluguName: 'కొలస్సీయులకు',             englishName: 'Colossians',
    aliases: ['colossians','col','co'] },
  { id: '1థెస్సలొనికయులకు',         teluguName: '1థెస్సలొనికయులకు',         englishName: '1 Thessalonians',
    aliases: ['1thessalonians','1thess','1thes','1th','ithessalonians'] },
  { id: '2థెస్సలొనికయులకు',         teluguName: '2థెస్సలొనికయులకు',         englishName: '2 Thessalonians',
    aliases: ['2thessalonians','2thess','2thes','2th','iithessalonians'] },
  { id: '1తిమోతికి',                 teluguName: '1తిమోతికి',                 englishName: '1 Timothy',
    aliases: ['1timothy','1tim','1ti','itimothy','itim'] },
  { id: '2తిమోతికి',                 teluguName: '2తిమోతికి',                 englishName: '2 Timothy',
    aliases: ['2timothy','2tim','2ti','iitimothy','iitim'] },
  { id: 'తీతుకు',                   teluguName: 'తీతుకు',                   englishName: 'Titus',
    aliases: ['titus','tit','ti'] },
  { id: 'ఫిలేమోనుకు',               teluguName: 'ఫిలేమోనుకు',               englishName: 'Philemon',
    aliases: ['philemon','phlm','phm','pm'] },
  { id: 'హెబ్రీయులకు',              teluguName: 'హెబ్రీయులకు',              englishName: 'Hebrews',
    aliases: ['hebrews','heb','he'] },
  { id: 'యాకోబు',                   teluguName: 'యాకోబు',                   englishName: 'James',
    aliases: ['james','jas','jam','jm'] },
  { id: '1పేతురు',                  teluguName: '1పేతురు',                  englishName: '1 Peter',
    aliases: ['1peter','1pet','1pe','1pt','ipeter','ipet'] },
  { id: '2పేతురు',                  teluguName: '2పేతురు',                  englishName: '2 Peter',
    aliases: ['2peter','2pet','2pe','2pt','iipeter','iipet'] },
  { id: '1యోహాను',                  teluguName: '1యోహాను',                  englishName: '1 John',
    aliases: ['1john','1jhn','1jn','1jo','ijohn','ijn'] },
  { id: '2యోహాను',                  teluguName: '2యోహాను',                  englishName: '2 John',
    aliases: ['2john','2jhn','2jn','2jo','iijohn','iijn'] },
  { id: '3యోహాను',                  teluguName: '3యోహాను',                  englishName: '3 John',
    aliases: ['3john','3jhn','3jn','3jo','iiijohn','iiijn'] },
  { id: 'యూదా',                     teluguName: 'యూదా',                     englishName: 'Jude',
    aliases: ['jude','jud'] },
  { id: 'ప్రకటన గ్రంథం',            teluguName: 'ప్రకటన గ్రంథం',            englishName: 'Revelation',
    aliases: ['revelation','revelations','rev','re','rv','apocalypse'] },
];

// ── Lookup helpers ───────────────────────────────────────────────────────────

/** Normalize a string for alias matching: lowercase + remove whitespace. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '');
}

/** alias (normalized) → BookEntry */
const aliasMap = new Map<string, BookEntry>();
for (const book of BIBLE_BOOKS) {
  // Index every alias
  for (const alias of book.aliases) {
    aliasMap.set(alias, book);
  }
  // Also index the normalized English name itself
  aliasMap.set(normalize(book.englishName), book);
}

/** Look up a book by any English name or abbreviation (case-insensitive). */
export function findBookByEnglish(query: string): BookEntry | undefined {
  return aliasMap.get(normalize(query));
}

// ── Fuzzy / prefix search ────────────────────────────────────────────────────

export interface BookSearchResult {
  book: BookEntry;
  /** 0–100; higher = better match quality */
  score: number;
}

/**
 * Return all books whose English name or aliases start with `query`.
 * Results are sorted by score (exact > full-word-prefix > character-prefix).
 */
export function searchBooksByEnglish(query: string): BookSearchResult[] {
  if (!query.trim()) return [];
  const q = normalize(query);
  const seen = new Set<string>();
  const results: BookSearchResult[] = [];

  for (const book of BIBLE_BOOKS) {
    if (seen.has(book.id)) continue;

    const terms = [normalize(book.englishName), ...book.aliases];
    let best = 0;

    for (const term of terms) {
      if (term === q) {
        best = 100; break;                          // exact match
      } else if (term.startsWith(q)) {
        const s = 50 + Math.round((q.length / term.length) * 49);
        if (s > best) best = s;                     // prefix match
      }
    }

    if (best > 0) {
      results.push({ book, score: best });
      seen.add(book.id);
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

// ── Reference parser ─────────────────────────────────────────────────────────

export interface ReferenceMatch {
  book: BookEntry;
  chapter: number;
  verse?: number;
}

/**
 * Parse an English reference string such as:
 *   "john 3:16"    → { book: John entry, chapter: 3, verse: 16 }
 *   "gen 1:1"      → { book: Genesis entry, chapter: 1, verse: 1 }
 *   "romans 8"     → { book: Romans entry, chapter: 8 }
 *   "ps 23"        → { book: Psalms entry, chapter: 23 }
 *
 * Returns null if the query cannot be parsed as a valid reference.
 */
export function parseReference(query: string): ReferenceMatch | null {
  const q = query.trim();

  // "book chapter:verse"  — e.g. "john 3:16", "1 john 3:16"
  const fullRef = q.match(/^(.+?)\s+(\d+)[:\s]+(\d+)$/i);
  if (fullRef) {
    const book = findBookByEnglish(fullRef[1].trim());
    if (book) {
      return { book, chapter: parseInt(fullRef[2], 10), verse: parseInt(fullRef[3], 10) };
    }
  }

  // "book chapter"  — e.g. "john 3", "ps 23"
  const chapterRef = q.match(/^(.+?)\s+(\d+)$/i);
  if (chapterRef) {
    const book = findBookByEnglish(chapterRef[1].trim());
    if (book) {
      return { book, chapter: parseInt(chapterRef[2], 10) };
    }
  }

  return null;
}
