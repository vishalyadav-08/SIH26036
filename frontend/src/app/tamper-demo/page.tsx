"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { api } from "@/lib/api";

type DemoResult = {
  payload: any;
  hash: string;
  signatureValid: boolean;
  verification: string;
};

export default function TamperDemoPage() {
  const [originalData, setOriginalData] = useState<DemoResult | null>(null);
  const [jsonText, setJsonText] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<DemoResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    fetchOriginal();
  }, []);

  const fetchOriginal = async () => {
    try {
      const data = await api.get<DemoResult>("/certificates/demo/tamper");
      setOriginalData(data);
      setCurrentResult(data);
      setJsonText(JSON.stringify(data.payload, null, 2));
      setParseError(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async () => {
    setParseError(null);
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(jsonText);
    } catch (err: any) {
      setParseError("Invalid JSON: " + err.message);
      return;
    }

    setIsVerifying(true);
    try {
      const data = await api.post<DemoResult>("/certificates/demo/tamper", parsedPayload);
      setCurrentResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-6">
      <PageHeader title="Interactive Tamper Demo" />
      
      <p className="text-gray-600 mb-6 max-w-3xl">
        This is a live interactive simulation. The original certificate data was hashed and signed by the backend.
        You can edit the JSON payload below and submit it. The backend will re-compute the hash of your modified data 
        and verify it against the <strong>original RSA signature</strong>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT: JSON Editor */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader>
            <CardTitle>Certificate Payload (JSON)</CardTitle>
            <CardDescription>Edit the data live to simulate a tampering attack.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <textarea 
              className="flex-1 w-full bg-slate-900 text-green-400 p-4 font-mono text-sm rounded-md border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
            {parseError && (
              <div className="text-red-500 text-sm mt-2 font-medium bg-red-50 p-2 rounded">{parseError}</div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-slate-50 p-4">
            <Button variant="outline" onClick={fetchOriginal}>Reset to Original</Button>
            <Button onClick={handleVerify} disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify Data on Backend"}
            </Button>
          </CardFooter>
        </Card>

        {/* RIGHT: Verification Process */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Backend Verification Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Hash Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">1. Computed SHA-256 Hash</h3>
                <div className="bg-slate-100 p-3 rounded font-mono text-xs text-slate-800 break-all border border-slate-200">
                  {currentResult?.hash || "..."}
                </div>
                {originalData && currentResult && originalData.hash !== currentResult.hash && (
                  <div className="text-red-600 text-sm mt-2 font-medium flex items-center">
                    <span className="mr-1">⚠️</span> Hash mismatch! Data was altered.
                  </div>
                )}
              </div>

              {/* Signature Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">2. RSA Signature Verification</h3>
                <div className="flex items-center gap-3">
                  {currentResult?.signatureValid ? (
                    <div className="flex items-center text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200 font-medium">
                      <span className="mr-2">✓</span> Valid Signature Match
                    </div>
                  ) : (
                    <div className="flex items-center text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200 font-medium">
                      <span className="mr-2">✗</span> Invalid Signature Match
                    </div>
                  )}
                </div>
                {!currentResult?.signatureValid && (
                  <p className="text-sm text-slate-600 mt-2">
                    The newly computed hash does not match the one encrypted in the original digital signature.
                  </p>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Final Result */}
          <Card className={`border-2 ${currentResult?.verification === 'VALID' ? 'border-green-500' : 'border-red-500 shadow-md'}`}>
            <CardHeader className={currentResult?.verification === 'VALID' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
              <CardTitle>FINAL VERIFICATION RESULT</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className={`text-3xl font-black tracking-tight flex items-center ${currentResult?.verification === 'VALID' ? 'text-green-600' : 'text-red-600'}`}>
                {currentResult?.verification === 'VALID' ? (
                  <><span className="mr-3">✓</span> VALID</>
                ) : (
                  <><span className="mr-3">✗</span> INVALID</>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
