import { Injectable, Logger } from "@nestjs/common";
import { QwenService } from "./qwen.service";
import * as crypto from "crypto";
const pdfParse = require("pdf-parse");

@Injectable()
export class ResumeAnalysisService {
  private readonly logger = new Logger(ResumeAnalysisService.name);
  private readonly cache = new Map<string, any>();

  constructor(private readonly qwenService: QwenService) {}

  async analyze(resumeBuffer: Buffer, jobDescription: string) {
    const hash = crypto
      .createHash("sha256")
      .update(resumeBuffer)
      .update(jobDescription)
      .digest("hex");
    if (this.cache.has(hash)) {
      this.logger.log(
        "Performance Rule: Returning cached analysis result to avoid repeated AI calls",
      );
      return this.cache.get(hash);
    }

    let resumeText = "";
    try {
      const pdfData = await pdfParse(resumeBuffer);
      resumeText = pdfData.text;
      this.logger.log(
        "Extracted text from PDF resume, length: " + resumeText.length,
      );
    } catch (err) {
      this.logger.warn(
        "Failed to parse PDF, treating as raw string if possible",
      );
      resumeText = resumeBuffer.toString("utf-8");
    }

    this.logger.log("Extracting skills via Qwen Engine...");

    const [resumeData, jdData] = await Promise.all([
      this.qwenService.extractResumeSkills(resumeText),
      this.qwenService.extractJdSkills(jobDescription),
    ]);

    const resumeSkills = resumeData.skills || [];
    const requiredSkills = jdData.required_skills || [];

    const missingSkills: any[] = [];
    const weakSkills: any[] = [];
    const strongSkills: any[] = [];
    const reasoningTrace: any[] = [];
    const learningPath: string[] = [];

    const resumeSkillMap = new Map();
    for (const rs of resumeSkills) {
      resumeSkillMap.set(rs.name.toLowerCase().trim(), rs);
    }

    for (const reqSkill of requiredSkills) {
      const reqName = reqSkill.name.toLowerCase().trim();
      const matchingUserSkill =
        resumeSkillMap.get(reqName) ||
        Array.from(resumeSkillMap.values()).find(
          (rs: any) =>
            rs.name.toLowerCase().includes(reqName) ||
            reqName.includes(rs.name.toLowerCase()),
        );

      const userLevel = matchingUserSkill ? matchingUserSkill.level : 0;
      const importance = reqSkill.importance || 0.5;

      const gapScore = Math.max(0, importance - userLevel);

      const reason = `${reqSkill.name} is marked as a gap because:\n- Required by job (importance: ${importance})\n- Your level: ${userLevel}\n- Gap score: ${gapScore.toFixed(2)}`;
      reasoningTrace.push({ skill: reqSkill.name, reason });

      const gapEntry = {
        skill: reqSkill.name,
        user_level: userLevel,
        required_importance: importance,
        gap_score: gapScore,
      };

      if (gapScore > 0.5) {
        missingSkills.push(gapEntry);
      } else if (gapScore >= 0.2 && gapScore <= 0.5) {
        weakSkills.push(gapEntry);
      } else {
        strongSkills.push(gapEntry);
      }
    }

    const itemsToLearn = [...missingSkills, ...weakSkills].sort(
      (a, b) => b.required_importance - a.required_importance,
    );

    for (const item of itemsToLearn) {
      if (gapScoreIsMissing(item.gap_score)) {
        learningPath.push(`Learn ${item.skill} Basics`);
      } else {
        learningPath.push(`Master ${item.skill} advanced concepts`);
      }
    }

    function gapScoreIsMissing(score: number): boolean {
      return score > 0.5;
    }

    const finalResult = {
      skillsExtracted: resumeSkills,
      domain: resumeData.domain,
      jobRole: jdData.role,
      requiredSkillsExtracted: requiredSkills,
      gapAnalysis: {
        missing_skills: missingSkills,
        weak_skills: weakSkills,
        strong_skills: strongSkills,
      },
      learningPath: learningPath,
      reasoningTrace: reasoningTrace,
    };

    this.cache.set(hash, finalResult);
    return finalResult;
  }
}
