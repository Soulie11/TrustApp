import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ANALYSIS_ENDPOINT, API_BASE, fetchAnalysis } from "../api";
import { createDemoAnalysis, defaultRequest } from "../mockData";
import type { AnalysisRequest, ApiState, CompanyAnalysis } from "../types";
import { exportAnalysisJson } from "../utils/export";
import { readError } from "../utils/formatters";

export function useReputationAnalysis() {
  const [request, setRequest] = useState<AnalysisRequest>(defaultRequest);
  const [analysis, setAnalysis] = useState<CompanyAnalysis>(() =>
    createDemoAnalysis(defaultRequest)
  );
  const [apiState, setApiState] = useState<ApiState>("demo");
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState(
    "Tryb demo: podłącz backend przez VITE_API_URL albo ten sam origin."
  );

  const endpointLabel = `${API_BASE}${ANALYSIS_ENDPOINT}`;
  const highestKeyword = useMemo(
    () =>
      analysis.riskKeywords.reduce(
        (top, keyword) => (keyword.weight > top.weight ? keyword : top),
        analysis.riskKeywords[0]
      ),
    [analysis.riskKeywords]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setNotice("Analiza w toku...");

    try {
      const result = await fetchAnalysis(request);
      setAnalysis(result);
      setApiState("live");
      setNotice(`Backend odpowiedział: ${endpointLabel}`);
    } catch (error) {
      setAnalysis(createDemoAnalysis(request));
      setApiState("fallback");
      setNotice(
        `Backend niedostępny, pokazuję dane demo zgodne z kontraktem. ${readError(
          error
        )}`
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateRequest<K extends keyof AnalysisRequest>(
    key: K,
    value: AnalysisRequest[K]
  ) {
    setRequest((current) => ({ ...current, [key]: value }));
  }

  function updateOption<K extends keyof AnalysisRequest["options"]>(
    key: K,
    value: AnalysisRequest["options"][K]
  ) {
    setRequest((current) => ({
      ...current,
      options: { ...current.options, [key]: value },
    }));
  }

  function handleAttachments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    }));
    updateRequest("attachments", files);
  }

  function exportJson() {
    exportAnalysisJson(analysis);
  }

  return {
    analysis,
    apiState,
    exportJson,
    handleAttachments,
    handleSubmit,
    highestKeyword,
    isLoading,
    notice,
    request,
    updateOption,
    updateRequest,
  };
}
