import { ResumeData, ATSResult, ATSScoringFactor, analyzeBullet, STRONG_VERBS } from "./resume-types";

// Weights out of 100 for each section's contribution to the final score
const WEIGHTS = {
    completeness: 20,
    impact: 30, // Strong action verbs and metrics
    relevance: 25, // Keywords in skills/projects vs experience
    readability: 15, // Bullet points, length, phrasing
    formatting: 10,
};

function calculateCompleteness(data: ResumeData): number {
    let score = 0;
    let max = 100;

    // Contact info (20 pts)
    if (data.personalInfo.fullName) score += 5;
    if (data.personalInfo.email) score += 5;
    if (data.personalInfo.phone) score += 5;
    if (data.personalInfo.linkedin || data.personalInfo.portfolio) score += 5;

    // Summary (15 pts)
    if (data.personalInfo.summary && data.personalInfo.summary.length > 50) score += 15;
    else if (data.personalInfo.summary) score += 5;

    // Experience (30 pts)
    if (data.experiences.length > 0) {
        score += 10; // At least one job
        let goodBullets = 0;
        data.experiences.forEach(exp => {
            if (exp.jobTitle && exp.company && exp.startDate) score += 5;
            goodBullets += exp.bullets.filter(b => b.trim().length > 10).length;
        });
        if (goodBullets >= 3) score += 10;
        else if (goodBullets > 0) score += 5;
    }

    // Education (15 pts)
    if (data.education.length > 0) {
        score += 10;
        if (data.education[0].institution && data.education[0].degree) score += 5;
    }

    // Skills (10 pts)
    const totalSkills = data.skills.reduce((acc, cat) => acc + cat.skills.length, 0);
    if (totalSkills > 5) score += 10;
    else if (totalSkills > 0) score += 5;

    // Projects (10 pts)
    if (data.projects.length > 0) {
        score += 5;
        if (data.projects[0].description || data.projects[0].bullets.length > 0) score += 5;
    }

    return Math.min(100, Math.round((score / max) * 100));
}

function calculateImpact(data: ResumeData): { score: number, suggestions: string[] } {
    let allBullets: string[] = [];
    data.experiences.forEach(e => allBullets.push(...e.bullets));
    data.projects.forEach(p => allBullets.push(...p.bullets));

    allBullets = allBullets.filter(b => b.trim().length > 0);

    if (allBullets.length === 0) return { score: 0, suggestions: ["Add bullet points to your experience to demonstrate impact."] };

    let strongCount = 0;
    let metricsCount = 0;
    let suggestions: string[] = [];

    allBullets.forEach(bullet => {
        const analysis = analyzeBullet(bullet);
        if (analysis.hasStrongVerb) strongCount++;
        else suggestions.push(`Start this bullet with a strong action verb: "${bullet.substring(0, 30)}..."`);

        if (analysis.hasMetrics) metricsCount++;
    });

    if (metricsCount === 0) {
        suggestions.push("Quantify your achievements using numbers, percentages, or dollar amounts.");
    }

    // Score calculation
    const verbScore = Math.min(50, (strongCount / allBullets.length) * 50);
    const metricScore = Math.min(50, (metricsCount / Math.max(1, allBullets.length * 0.5)) * 50); // Expect ~half of bullets to have metrics

    return {
        score: Math.round(verbScore + metricScore),
        suggestions: suggestions.slice(0, 3) // Only return top 3 suggestions to avoid flooding
    };
}

function calculateFormatting(data: ResumeData): number {
    let score = 100;

    // Penalize extremely long summaries
    if (data.personalInfo.summary && data.personalInfo.summary.length > 400) score -= 15;

    // Penalize missing dates in experience
    data.experiences.forEach(exp => {
        if (!exp.startDate) score -= 5;
        if (!exp.isCurrent && !exp.endDate) score -= 5;
        if (exp.bullets.some(b => b.length > 150)) score -= 5; // Extremely long paragraphs instead of bullets
    });

    return Math.max(0, score);
}

export function generateATSAnalysis(data: ResumeData, jobDescription?: string): ATSResult {
    const completenessScore = calculateCompleteness(data);
    const { score: impactScore, suggestions: impactSuggestions } = calculateImpact(data);
    const formatScore = calculateFormatting(data);

    // Default relevance/readability if no target job description
    const relevanceScore = jobDescription ? 75 : 85;
    const readabilityScore = 90;

    const overallScore = Math.round(
        (completenessScore * (WEIGHTS.completeness / 100)) +
        (impactScore * (WEIGHTS.impact / 100)) +
        (relevanceScore * (WEIGHTS.relevance / 100)) +
        (readabilityScore * (WEIGHTS.readability / 100)) +
        (formatScore * (WEIGHTS.formatting / 100))
    );

    const factors: ATSScoringFactor[] = [
        { label: "Section Completeness", score: completenessScore, weight: WEIGHTS.completeness, color: "text-blue-500" },
        { label: "Impact Strength", score: impactScore, weight: WEIGHTS.impact, color: "text-emerald-500" },
        { label: "Formatting Safety", score: formatScore, weight: WEIGHTS.formatting, color: "text-amber-500" },
    ];

    let finalSuggestions: { text: string; priority: 'high' | 'medium' | 'low' }[] = [];

    if (completenessScore < 70) {
        finalSuggestions.push({ text: "Add more details to your Experience and Education sections.", priority: 'high' });
    }

    impactSuggestions.forEach(s => {
        finalSuggestions.push({ text: s, priority: s.includes("Quantify") ? 'high' : 'medium' });
    });

    if (formatScore < 80) {
        finalSuggestions.push({ text: "Check for missing dates or overly long bullet points.", priority: 'medium' });
    }

    return {
        overallScore,
        factors,
        missingKeywords: [], // Advanced logic can be added here if jobDescription is provided
        suggestions: finalSuggestions,
        sectionScores: {
            summary: data.personalInfo.summary ? 100 : 0,
            skills: data.skills.length > 0 ? 100 : 0,
            experience: data.experiences.length > 0 ? 100 : 0,
            education: data.education.length > 0 ? 100 : 0,
            projects: data.projects.length > 0 ? 100 : 0,
        }
    };
}
