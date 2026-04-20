import type { CompanyAnalysis } from "../types";
import { slugify } from "./formatters";

export function exportAnalysisJson(analysis: CompanyAnalysis) {
  const blob = new Blob([JSON.stringify(analysis, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(analysis.company.name)}-checktrust.json`;
  link.click();
  URL.revokeObjectURL(url);
}
