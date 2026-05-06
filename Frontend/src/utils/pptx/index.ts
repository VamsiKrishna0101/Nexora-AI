import pptxgen from "pptxgenjs";
import { createCoverSlide } from "./cover";
import { 
  createIdentitySlide, 
  createTrajectorySlide, 
  createPsychometricsSlide, 
  createDriversSlide, 
  createFrictionSlide 
} from "./behavioral";
import { 
  createAchievementsSlide, 
  createAwardsSlide, 
  createExpertiseSlide, 
  createSkillsSlide 
} from "./expertise";
import { 
  createLinkedInSlide, 
  createTwitterSlide, 
  createThoughtLeadershipSlide, 
  createNetworkSlide 
} from "./influence";
import { 
  createOutreachOpenersSlide, 
  createOutreachScriptSlide, 
  createRiskSlide, 
  createVerdictSlide, 
  createScoreSlide 
} from "./verdict";
import { addSectionSlide } from "./components";
import { parseSection } from "./parser";

export const generatePPT = async (personaData: any) => {
  if (!personaData) {
    console.error("No persona data provided to generatePPT");
    return;
  }

  const ppt = new pptxgen();
  ppt.layout = "LAYOUT_WIDE";

  // Resilience: Check if sections is nested or at root
  let S = personaData.sections;
  if (!S && personaData.report_data && personaData.report_data.sections) {
    S = personaData.report_data.sections;
  }
  if (!S) S = personaData;
  
  if (!S || Object.keys(S).length === 0) {
    console.error("Could not find sections in persona data", personaData);
    return;
  }

  // Parse all relevant sections once
  const sections = {
    profile: parseSection(S.executive_profile),
    journey: parseSection(S.professional_journey),
    personality: parseSection(S.personality_analysis),
    achievements: parseSection(S.professional_achievements),
    skills: parseSection(S.skills_expertise),
    online: parseSection(S.online_presence),
    social: parseSection(S.social_content_summary || S.speaks_or_writes),
    network: parseSection(S.network_influence || S.events_networking),
    outreach: parseSection(S.how_to_engage),
    risk: parseSection(S.red_flags),
    verdict: parseSection(S.analyst_verdict)
  };

  const subject = personaData.report_data?.subject || personaData.subject || {};

  // 1. COVER
  createCoverSlide(ppt, {
    name: sections.profile?.full_name || subject.name || "Executive Persona",
    role: sections.profile?.current_role || subject.designation || "CEO",
    company: sections.profile?.company || subject.company || "Google",
    profile: sections.profile || {}
  });

  // 2. IDENTITY & TRAJECTORY
  createIdentitySlide(ppt, {
    profData: sections.journey || {}
  });
  createTrajectorySlide(ppt, {
    profData: sections.journey || {}
  });

  // 3. BEHAVIORAL INTELLIGENCE
  createPsychometricsSlide(ppt, {
    personality: sections.personality || {}
  });
  createDriversSlide(ppt, {
    personality: sections.personality || {}
  });
  createFrictionSlide(ppt, {
    personality: sections.personality || {}
  });

  // 4. ACHIEVEMENTS & EXPERTISE
  createAchievementsSlide(ppt, {
    achievements: sections.achievements || {}
  });
  createAwardsSlide(ppt, {
    achievements: sections.achievements || {}
  });
  createExpertiseSlide(ppt, {
    skills: sections.skills || {}
  });
  createSkillsSlide(ppt, {
    skills: sections.skills || {}
  });

  // 5. DIGITAL FOOTPRINT & NETWORK
  createLinkedInSlide(ppt, {
    online: sections.online || {}
  });
  createTwitterSlide(ppt, {
    online: sections.online || {}
  });
  createThoughtLeadershipSlide(ppt, {
    thoughtLead: sections.social || {}
  });
  createNetworkSlide(ppt, {
    network: sections.network || {}
  });

  // 6. STRATEGIC PLAYBOOK
  createOutreachOpenersSlide(ppt, {
    outreach: sections.outreach || {}
  });
  createOutreachScriptSlide(ppt, {
    outreach: sections.outreach || {}
  });
  createRiskSlide(ppt, {
    risk: { data: sections.risk },
  });
  createVerdictSlide(ppt, {
    verdict: { data: sections.verdict }
  });
  createScoreSlide(ppt, {
    verdict: { data: sections.verdict }
  });

  // Save the presentation
  const fileName = `${sections.profile?.full_name?.replace(/\s+/g, "_") || "Persona"}_Intel_Dossier.pptx`;
  await ppt.writeFile({ fileName });
};
