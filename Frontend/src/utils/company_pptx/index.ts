import pptxgen from "pptxgenjs";
import { createCompanyCoverSlide } from "./cover";
import { createMarketSlide } from "./market";
import { createSwotSlide } from "./swot";
import { createFinancialsSlide } from "./financials";
import { createLeadershipSlide } from "./leadership";
import { createVerdictSlide } from "./verdict";
import { createTechnologySlide } from "./technology";

export const generateCompanyPPT = async (companyData: any) => {
  if (!companyData) {
    console.error("No company data provided to generateCompanyPPT");
    return;
  }

  const ppt = new pptxgen();
  ppt.layout = "LAYOUT_WIDE";

  let S = companyData;
  if (companyData.report_data && companyData.report_data.sections) {
    S = companyData.report_data.sections;
  } else if (companyData.sections) {
    S = companyData.sections;
  }

  let companyName = S.companyName || "Target Company";
  if (!S.companyName && S.executive_brief) {
     const nameMatch = S.executive_brief.match(/\*\*([^\s]+)/);
     if (nameMatch) {
         companyName = nameMatch[1].replace('—', '').trim();
     }
  }

  // Preload Images
  const preloadedImages: Record<string, string> = {};
  
  // Preload Logo - Hyper-verbose check
  console.log("**************************************************");
  console.log("DEBUG: GENERATE COMPANY PPT TRIGGERED");
  console.log("**************************************************");
  console.log("DEBUG: companyData keys:", Object.keys(companyData));
  console.log("DEBUG: S keys:", Object.keys(S));

  let logoUrl = companyData.logo_url || companyData.logo || companyData.logoUrl || S.logo_url || S.logo || S.logoUrl;
  
  // Fallback: Deep search for anything looking like a logo URL in the entire object
  if (!logoUrl) {
      const searchObj = (obj: any): string | null => {
          for (const key in obj) {
              if (typeof obj[key] === 'string' && (obj[key].includes('logo') || obj[key].includes('companyenrich.com'))) {
                  return obj[key];
              }
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                  const found = searchObj(obj[key]);
                  if (found) return found;
              }
          }
          return null;
      };
      logoUrl = searchObj(companyData);
      if (logoUrl) console.log("DEBUG: Found logoUrl via deep search:", logoUrl);
  }

  console.log("DEBUG: Final logoUrl for preloading:", logoUrl);

  if (logoUrl && typeof logoUrl === 'string' && logoUrl.startsWith('http')) {
      console.log("DEBUG: Starting fetch for logo via proxy...");
      try {
          const proxyUrl = `http://localhost:8000/api/proxy-image?url=${encodeURIComponent(logoUrl)}`;
          const res = await fetch(proxyUrl);
          console.log("DEBUG: Proxy response status:", res.status);
          if (res.ok) {
              const blob = await res.blob();
              const base64 = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
              });
              preloadedImages['COMPANY_LOGO'] = base64;
              console.log("DEBUG: LOGO PRELOAD SUCCESS: Base64 length", base64.length);
          }
      } catch (e) { 
          console.error("DEBUG: LOGO PRELOAD ERROR:", e); 
      }
  } else {
      console.warn("DEBUG: No valid logo URL found to preload");
  }

  if (S.leaders_data && Array.isArray(S.leaders_data)) {
      console.log(`Preloading ${S.leaders_data.length} leader images...`);
      for (const leader of S.leaders_data.slice(0, 10)) {
          if (leader.image_url) {
              try {
                  const proxyUrl = `http://localhost:8000/api/proxy-image?url=${encodeURIComponent(leader.image_url)}`;
                  const res = await fetch(proxyUrl);
                  if (res.ok) {
                      const blob = await res.blob();
                      const base64 = await new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onloadend = () => resolve(reader.result as string);
                          reader.readAsDataURL(blob);
                      });
                      preloadedImages[leader.name] = base64;
                  } else {
                      console.warn(`Proxy returned status ${res.status} for ${leader.name}`);
                  }
              } catch (e) {
                  console.warn("Failed to fetch profile image for", leader.name, e);
              }
          }
      }
  }

  const contextData = { ...S, companyName, preloadedImages };

  try {
    createCompanyCoverSlide(ppt, contextData);
    createMarketSlide(ppt, contextData);
    createSwotSlide(ppt, contextData);
    createFinancialsSlide(ppt, contextData);
    createTechnologySlide(ppt, contextData);
    createLeadershipSlide(ppt, contextData);
    createVerdictSlide(ppt, contextData);

    const fileName = `${companyName.replace(/[^a-zA-Z0-9]/g, "_")}_Company_Intel_Dossier.pptx`;
    await ppt.writeFile({ fileName });
  } catch (error) {
    console.error("Error generating Company PPT:", error);
  }
};
