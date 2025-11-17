"use client";

import * as React from "react";
import { validateThemeContrast, type ThemeContrastValidation } from "@/lib/utils/contrast";
import { useTheme } from "./ThemeProvider";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Contrast Validator Component
 * Displays contrast ratio validation results for theme colors
 * Only visible in development mode
 */
export function ContrastValidator() {
  const theme = useTheme();
  const [validations, setValidations] = React.useState<ThemeContrastValidation[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (theme && process.env.NODE_ENV === "development") {
      const results = validateThemeContrast(theme);
      setValidations(results);
    }
  }, [theme]);

  // Only show in development
  if (process.env.NODE_ENV !== "development" || !theme) {
    return null;
  }

  const failures = validations.filter((v) => !v.result.meetsAA);
  const warnings = validations.filter((v) => v.result.meetsAA && !v.result.meetsAAA);
  const passes = validations.filter((v) => v.result.meetsAAA);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-white border-2 rounded-lg shadow-lg p-3 touch-target tap-feedback",
          failures.length > 0 ? "border-error" : "border-primary",
        )}
        aria-label="Toggle contrast validator"
      >
        <div className="flex items-center gap-2">
          {failures.length > 0 ? (
            <AlertCircle className="h-5 w-5 text-error" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-success" />
          )}
          <span className="text-sm font-semibold">
            Contrast: {passes.length + warnings.length}/{validations.length} Pass
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">WCAG Contrast Validation</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-light hover:text-text touch-target tap-feedback"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Failures */}
            {failures.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-error" />
                  <h4 className="font-semibold text-error">
                    Failures ({failures.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {failures.map((validation, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-error/10 border border-error/20 rounded"
                    >
                      <div className="font-medium text-sm mb-1">
                        {validation.combination}
                      </div>
                      <div className="text-xs text-text-light mb-2">
                        {validation.result.message}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: validation.textColor }}
                          title={`Text: ${validation.textColor}`}
                        />
                        <span>on</span>
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: validation.backgroundColor }}
                          title={`Background: ${validation.backgroundColor}`}
                        />
                        <span className="text-text-light">
                          Ratio: {validation.result.ratio?.toFixed(2)}:1
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings (AA but not AAA) */}
            {warnings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-warning" />
                  <h4 className="font-semibold text-warning">
                    AA Only ({warnings.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {warnings.map((validation, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-warning/10 border border-warning/20 rounded"
                    >
                      <div className="font-medium text-sm mb-1">
                        {validation.combination}
                      </div>
                      <div className="text-xs text-text-light">
                        {validation.result.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passes (AAA) */}
            {passes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <h4 className="font-semibold text-success">
                    AAA Pass ({passes.length})
                  </h4>
                </div>
                <div className="space-y-1">
                  {passes.map((validation, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-success/10 border border-success/20 rounded text-xs"
                    >
                      <div className="font-medium">{validation.combination}</div>
                      <div className="text-text-light">
                        {validation.result.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-text-light">
                <p className="mb-1">
                  <strong>WCAG Standards:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>AA: 4.5:1 (normal text), 3:1 (large text)</li>
                  <li>AAA: 7:1 (normal text), 4.5:1 (large text)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

