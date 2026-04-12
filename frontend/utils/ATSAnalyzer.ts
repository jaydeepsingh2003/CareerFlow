export interface ResumeDataForATS {
    basics: {
        email?: string;
        phone?: string;
        summary?: string;
    };
    experience: Array<{
        descriptionBullets: string[];
    }>;
    education: Array<any>;
    skills: Array<{ items: string[] }>;
}

export interface ATSAnalysisResult {
    overallScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    actionVerbFeedback: string[];
    metricsFeedback: string[];
    completenessFeedback: string[];
}

const STRONG_ACTION_VERBS = new Set([
    'architected', 'spearheaded', 'optimized', 'engineered', 'developed', 'orchestrated',
    'streamlined', 'transformed', 'pioneered', 'implemented', 'designed', 'delivered',
    'managed', 'led', 'directed', 'executed', 'increased', 'reduced', 'improved', 'resolved',
    'automated', 'built', 'created', 'deployed', 'established', 'formulated', 'generated',
    'initiated', 'launched', 'maximized', 'moderated', 'negotiated', 'overhauled', 'redesigned',
    'revamped', 'secured', 'simplified', 'standardized', 'upgraded', 'accelerated', 'amplified',
    'boosted', 'catalyzed', 'conceived', 'consolidated', 'deciphered', 'devised', 'empowered',
    'facilitated', 'fostered', 'galvanized', 'integrated', 'mentored', 'mobilized', 'navigated',
    'outpaced', 'persuaded', 'quantified', 'reconciled', 'restructured', 'revitalized', 'surpassed',
    'yielded', 'adapted', 'aligned', 'championed', 'clarified', 'collaborated', 'cultivated',
    'diagnosed', 'elevated', 'envisioned', 'evaluated', 'expanded', 'expedited', 'forged',
    'harmonized', 'identified', 'influenced', 'instituted', 'leveraged', 'mapped', 'merged',
    'mitigated', 'orchestrated', 'overcame', 'piloted', 'projected', 'promoted', 'redefined',
    'refocused', 'rehabilitated', 'remedied', 'remodeled', 'reorganized', 'replaced', 'rescued',
    'restored', 'reversed', 'reviewed', 'safeguarded', 'salvaged', 'screened', 'scrutinized',
    'spearheaded', 'steered', 'stimulated', 'strategized', 'strengthened', 'substantiated',
    'succeeded', 'synthesized', 'systematized', 'tailored', 'targeted', 'traced', 'trained',
    'translated', 'troushot', 'unified', 'unraveled', 'validated', 'verified', 'visualized'
]);

// Common stop words to filter out from job descriptions
const STOP_WORDS = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'of', 'by', 'as', 'that', 'this']);

function extractKeywordsFromJD(jdText: string): string[] {
    if (!jdText) return [];
    const words = jdText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);

    const frequency: Record<string, number> = {};
    for (const word of words) {
        if (word.length > 2 && !STOP_WORDS.has(word)) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    }

    // Sort by frequency
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])
        .slice(0, 20); // Top 20 keywords
}

function extractResumeText(resume: ResumeDataForATS): string {
    let text = '';
    if (resume.basics.summary) text += resume.basics.summary + ' ';

    resume.experience.forEach(exp => {
        text += exp.descriptionBullets.join(' ') + ' ';
    });

    resume.skills.forEach(skillCategory => {
        text += skillCategory.items.join(' ') + ' ';
    });

    return text.toLowerCase();
}

export function analyzeResume(resume: ResumeDataForATS, jobDescription: string): ATSAnalysisResult {
    let score = 0;

    // 1. Keyword Matching (40% Weight)
    const jdKeywords = extractKeywordsFromJD(jobDescription);
    const resumeText = extractResumeText(resume);

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    for (const keyword of jdKeywords) {
        if (resumeText.includes(keyword)) {
            matchedKeywords.push(keyword);
        } else {
            missingKeywords.push(keyword);
        }
    }

    let keywordScore = 0;
    if (jdKeywords.length > 0) {
        keywordScore = (matchedKeywords.length / jdKeywords.length) * 40;
        score += keywordScore;
    } else {
        score += 40; // Full points if no JD provided
    }

    // 2. Action Verbs Check (30% Weight)
    const allBullets = resume.experience.flatMap(exp => exp.descriptionBullets).filter(b => b.trim().length > 0);
    let bulletsWithActionVerbs = 0;
    const actionVerbFeedback: string[] = [];

    for (const bullet of allBullets) {
        const firstWord = bullet.trim().split(' ')[0]?.toLowerCase();
        if (STRONG_ACTION_VERBS.has(firstWord)) {
            bulletsWithActionVerbs++;
        } else {
            actionVerbFeedback.push(`Consider starting this bullet with a strong action verb: "${bullet.substring(0, 30)}..."`);
        }
    }

    if (allBullets.length > 0) {
        const verbRatio = bulletsWithActionVerbs / allBullets.length;
        // Target 70% of bullets starting with action verbs
        const verbScore = Math.min(1, verbRatio / 0.7) * 30;
        score += verbScore;
    } else {
        actionVerbFeedback.push("No experience bullets found. Add descriptive bullet points.");
    }

    // 3. Metrics & Quantifiability (20% Weight)
    let bulletsWithMetrics = 0;
    const metricsFeedback: string[] = [];
    // Look for numbers, percentages, or dollar signs.
    const metricsRegex = /\d+%?|\$|[\d,]+\b/;

    for (const bullet of allBullets) {
        if (metricsRegex.test(bullet)) {
            bulletsWithMetrics++;
        }
    }

    if (allBullets.length > 0) {
        const metricsRatio = bulletsWithMetrics / allBullets.length;
        // Target at least 30% of bullets having metrics
        const metricsScore = Math.min(1, metricsRatio / 0.3) * 20;
        score += metricsScore;
        if (metricsRatio < 0.3) {
            metricsFeedback.push(`Only ${Math.round(metricsRatio * 100)}% of your bullets have metrics. Try to quantify more achievements (e.g. '%', '$', numbers).`);
        }
    }

    // 4. Completeness (10% Weight)
    let completenessPoints = 0;
    const completenessFeedback: string[] = [];

    if (resume.basics.email) completenessPoints += 2.5; else completenessFeedback.push("Missing email address.");
    if (resume.basics.phone) completenessPoints += 2.5; else completenessFeedback.push("Missing phone number.");
    if (resume.education.length > 0) completenessPoints += 2.5; else completenessFeedback.push("Missing education history.");

    const totalSkillItems = resume.skills.reduce((acc, cat) => acc + cat.items.length, 0);
    if (totalSkillItems >= 3) completenessPoints += 2.5; else completenessFeedback.push("Add at least 3 skills.");

    score += completenessPoints;

    return {
        overallScore: Math.round(score),
        matchedKeywords,
        missingKeywords,
        actionVerbFeedback,
        metricsFeedback,
        completenessFeedback
    };
}
