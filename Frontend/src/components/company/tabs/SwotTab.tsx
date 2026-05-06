import React from "react";
import ReactMarkdown from "react-markdown";
import "../styles/IntelligenceReport.css";

interface SwotTabProps {
  swot?: string;
}

const SwotTab: React.FC<SwotTabProps> = ({ swot }) => {
  const parseSwot = (text?: string) => {
    if (!text) return { s: [], w: [], o: [], t: [] };
    
    const sections = text.split(/\*\*(Strengths|Weaknesses|Opportunities|Threats):\*\*/);
    const result: any = { s: [], w: [], o: [], t: [] };
    
    const mapping: any = {
      "Strengths": "s",
      "Weaknesses": "w",
      "Opportunities": "o",
      "Threats": "t"
    };

    for (let i = 1; i < sections.length; i += 2) {
      const title = sections[i];
      const content = sections[i + 1];
      const key = mapping[title];
      if (key && content) {
        result[key] = content
          .split("\n")
          .filter(l => l.trim().startsWith("*") || l.trim().startsWith("-"))
          .map(l => l.trim().substring(1).trim());
      }
    }
    return result;
  };

  const data = parseSwot(swot);

  return (
    <div className="ir-panel">
      <div className="ir-swot-grid">
        <div className="ir-swot-box swot-s">
          <h3>Strengths</h3>
          <ul>
            {data.s.length > 0 ? data.s.map((item: string, idx: number) => (
              <li key={idx}><ReactMarkdown>{item}</ReactMarkdown></li>
            )) : <li>Strategic technical moat and data processing capabilities.</li>}
          </ul>
        </div>
        <div className="ir-swot-box swot-w">
          <h3>Weaknesses</h3>
          <ul>
            {data.w.length > 0 ? data.w.map((item: string, idx: number) => (
              <li key={idx}><ReactMarkdown>{item}</ReactMarkdown></li>
            )) : <li>Market perception as mid-market focused.</li>}
          </ul>
        </div>
        <div className="ir-swot-box swot-o">
          <h3>Opportunities</h3>
          <ul>
            {data.o.length > 0 ? data.o.map((item: string, idx: number) => (
              <li key={idx}><ReactMarkdown>{item}</ReactMarkdown></li>
            )) : <li>Global expansion into APAC and EMEA markets.</li>}
          </ul>
        </div>
        <div className="ir-swot-box swot-t">
          <h3>Threats</h3>
          <ul>
            {data.t.length > 0 ? data.t.map((item: string, idx: number) => (
              <li key={idx}><ReactMarkdown>{item}</ReactMarkdown></li>
            )) : <li>Intense competition from enterprise incumbents.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SwotTab;
