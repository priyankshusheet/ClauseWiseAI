import React, { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, X, AlertTriangle, AlertCircle, CheckCircle, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Configure PDF.js worker (same version as dependency)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";

interface Clause {
  text: string;
  category: string;
  riskLevel: string;
  explanation: string;
  clauseNumber?: string;
}

interface PdfClauseAnnotatorProps {
  file: File;
  clauses: Clause[];
}

type HighlightBox = {
  clauseIndex: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

const normalizeForSearch = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001F]/g, " ")
    .trim()
    .toLowerCase();

const getRiskStyle = (level: string) => {
  switch (level?.toLowerCase()) {
    case "high":
      return {
        box: "bg-destructive/20 border border-destructive/40 hover:bg-destructive/30",
      };
    case "medium":
      return {
        box: "bg-accent/20 border border-accent/40 hover:bg-accent/30",
      };
    case "low":
    case "safe":
      return {
        box: "bg-secondary/20 border border-secondary/40 hover:bg-secondary/30",
      };
    default:
      return {
        box: "bg-muted border border-border hover:bg-muted/80",
      };
  }
};

const getRiskIcon = (level: string) => {
  switch (level?.toLowerCase()) {
    case "high":
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "medium":
      return <AlertCircle className="w-4 h-4 text-accent-foreground" />;
    default:
      return <CheckCircle className="w-4 h-4 text-secondary" />;
  }
};

const PdfPage: React.FC<{
  pdf: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  clauses: Clause[];
  selectedClause: number | null;
  onSelect: (idx: number) => void;
}> = ({ pdf, pageNumber, scale, clauses, selectedClause, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number } | null>(null);
  const [highlights, setHighlights] = useState<HighlightBox[]>([]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      if (cancelled) return;

      setViewportSize({ width: viewport.width, height: viewport.height });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({ canvasContext: ctx, viewport }).promise;
      if (cancelled) return;

      const textContent = await page.getTextContent();
      if (cancelled) return;

      const items = (textContent.items as any[]).filter((it) => typeof it?.str === "string" && it.str.trim());

      // Build searchable page string and span index mapping
      let pageText = "";
      const spans: Array<{ start: number; end: number; item: any }> = [];
      for (const it of items) {
        const part = String(it.str ?? "").replace(/\s+/g, " ").trim();
        if (!part) continue;
        if (pageText.length > 0) pageText += " ";
        const start = pageText.length;
        pageText += part;
        const end = pageText.length;
        spans.push({ start, end, item: it });
      }

      const pageTextLower = pageText.toLowerCase();

      const boxes: HighlightBox[] = [];
      clauses.forEach((clause, clauseIndex) => {
        const needle = normalizeForSearch(clause.text.slice(0, 80));
        if (needle.length < 12) return;

        const pos = pageTextLower.indexOf(needle);
        if (pos === -1) return;

        const matchStart = pos;
        const matchEnd = pos + needle.length;

        for (const span of spans) {
          if (span.start >= matchEnd || span.end <= matchStart) continue;

          const it = span.item;
          // Convert PDF item transform to viewport pixels
          const tx = (pdfjsLib as any).Util.transform(viewport.transform, it.transform);
          const left = tx[4];
          const fontHeight = Math.abs(tx[3]) || Math.abs(tx[0]) || (it.height ? it.height * scale : 10);
          const top = tx[5] - fontHeight;
          const width = (it.width ? it.width * scale : Math.max(8, Math.abs(tx[0])));
          const height = Math.max(8, fontHeight);

          boxes.push({ clauseIndex, left, top, width, height });
        }
      });

      if (!cancelled) setHighlights(boxes);
    };

    run().catch((e) => {
      console.error("[PdfClauseAnnotator] Page render failed:", e);
      if (!cancelled) setHighlights([]);
    });

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, scale, clauses]);

  if (!viewportSize) {
    return <div className="h-[420px] rounded-lg border border-border bg-muted/20" />;
  }

  return (
    <div className="relative w-full" style={{ width: viewportSize.width, height: viewportSize.height }}>
      <canvas ref={canvasRef} className="rounded-lg border border-border bg-background" />

      {/* Highlight overlay */}
      <div className="absolute inset-0">
        {highlights.map((h, i) => {
          const clause = clauses[h.clauseIndex];
          const style = getRiskStyle(clause?.riskLevel);
          const isSelected = selectedClause === h.clauseIndex;

          return (
            <button
              key={`${pageNumber}-${h.clauseIndex}-${i}`}
              type="button"
              title={`${clause.category} — ${clause.riskLevel} risk`}
              onClick={() => onSelect(h.clauseIndex)}
              className={`${style.box} ${isSelected ? "ring-2 ring-primary" : ""} absolute rounded-sm transition-colors`}
              style={{
                left: h.left,
                top: h.top,
                width: h.width,
                height: h.height,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const PdfClauseAnnotator: React.FC<PdfClauseAnnotatorProps> = ({ file, clauses }) => {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClause, setSelectedClause] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1.15);

  const isPdf = useMemo(() => file.type.toLowerCase().includes("pdf") || file.name.toLowerCase().endsWith(".pdf"), [file]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setError(null);
      setPdf(null);
      setSelectedClause(null);

      if (!isPdf) {
        setError("This viewer supports PDF files only.");
        return;
      }

      const buffer = await file.arrayBuffer();
      const task = pdfjsLib.getDocument({ data: buffer });
      const doc = await task.promise;
      if (!cancelled) setPdf(doc);
    };

    load().catch((e) => {
      console.error("[PdfClauseAnnotator] PDF load failed:", e);
      if (!cancelled) setError("Unable to render PDF in the browser.");
    });

    return () => {
      cancelled = true;
    };
  }, [file, isPdf]);

  // Fit-to-width scaling based on first page
  useEffect(() => {
    if (!pdf) return;

    let ro: ResizeObserver | null = null;
    let cancelled = false;

    const computeScale = async () => {
      const el = containerRef.current;
      if (!el) return;

      const page = await pdf.getPage(1);
      const baseViewport = page.getViewport({ scale: 1 });
      const targetWidth = Math.max(320, Math.min(860, el.clientWidth));
      const next = Math.max(0.75, Math.min(2.0, targetWidth / baseViewport.width));
      if (!cancelled) setScale(next);
    };

    computeScale();

    ro = new ResizeObserver(() => computeScale());
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      cancelled = true;
      ro?.disconnect();
    };
  }, [pdf]);

  const selected = selectedClause !== null ? clauses[selectedClause] : null;

  if (!clauses?.length) return null;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Interactive Document Viewer
          <Badge variant="outline" className="ml-auto text-xs">
            {clauses.length} clauses flagged
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Click highlighted text to see risk details</p>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-muted-foreground">{error}</div>
        ) : !pdf ? (
          <div className="h-[500px] rounded-lg border border-border bg-muted/20" />
        ) : (
          <div className="flex gap-4 relative">
            <ScrollArea className={`${selected ? "w-3/5" : "w-full"} h-[500px] transition-all duration-300`}>
              <div ref={containerRef} className="pr-4 space-y-6">
                {Array.from({ length: pdf.numPages }, (_, idx) => (
                  <PdfPage
                    key={idx + 1}
                    pdf={pdf}
                    pageNumber={idx + 1}
                    scale={scale}
                    clauses={clauses}
                    selectedClause={selectedClause}
                    onSelect={(i) => setSelectedClause((prev) => (prev === i ? null : i))}
                  />
                ))}
              </div>
            </ScrollArea>

            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "40%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-l border-border pl-4 overflow-hidden"
                >
                  <div className="sticky top-0 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getRiskIcon(selected.riskLevel)}
                        <Badge
                          variant={
                            selected.riskLevel === "high"
                              ? "destructive"
                              : selected.riskLevel === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {selected.riskLevel?.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedClause(null)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div>
                      <Badge variant="outline" className="mb-2 text-xs">
                        {selected.category}
                      </Badge>
                      {selected.clauseNumber && (
                        <span className="text-xs text-muted-foreground ml-2">§{selected.clauseNumber}</span>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs font-medium text-foreground mb-1">Clause Text</p>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">"{selected.text}"</p>
                    </div>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-primary" />
                        What This Means
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{selected.explanation}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        disabled={selectedClause === 0}
                        onClick={() => setSelectedClause((prev) => Math.max(0, (prev ?? 0) - 1))}
                      >
                        ← Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        disabled={selectedClause === clauses.length - 1}
                        onClick={() => setSelectedClause((prev) => Math.min(clauses.length - 1, (prev ?? 0) + 1))}
                      >
                        Next →
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      {(selectedClause ?? 0) + 1} of {clauses.length}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-destructive/20 border border-destructive/40" /> High Risk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-accent/20 border border-accent/40" /> Medium Risk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-secondary/20 border border-secondary/40" /> Low/Safe
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfClauseAnnotator;
