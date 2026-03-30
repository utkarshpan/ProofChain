import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './index.css';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [heatmapUrl, setHeatmapUrl] = useState(null);
  const resultsRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setHeatmapUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1
  });

  // Generate PDF report
  const generatePDF = async () => {
    if (!resultsRef.current) return;
    
    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 10;
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(99, 102, 241);
      pdf.text('ProofChain - Fraud Report', 105, position, { align: 'center' });
      position += 15;
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, position, { align: 'center' });
      position += 15;
      
      // Add trust score
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`Trust Score: ${result.trust_score}/100`, 20, position);
      position += 10;
      
      pdf.text(`Risk Level: ${
        result.trust_score >= 80 ? 'Low Risk' :
        result.trust_score >= 50 ? 'Medium Risk' :
        'High Risk'
      }`, 20, position);
      position += 15;
      
      // Add screenshot
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      
      // Save PDF
      pdf.save(`proofchain-report-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF');
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      alert('Please select an image first');
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }
      
      const data = await response.json();
      setResult(data);
      setHeatmapUrl(data.heatmap_url);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`Analysis failed: ${error.message}\n\nMake sure backend is running on http://localhost:8000`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-card mx-6 mt-6">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text">🔗 ProofChain</h1>
              <p className="text-gray-300 text-sm mt-1">Digital Proof Trust Engine</p>
            </div>
            {result && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setResult(null);
                  setUploadedFile(null);
                  setPreviewUrl(null);
                  setHeatmapUrl(null);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                New Analysis
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Hero Section */}
              <div className="text-center mb-12">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-6xl font-bold mb-4 gradient-text"
                >
                  Verify Payment Proofs
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-300 text-lg max-w-2xl mx-auto"
                >
                  Upload a payment screenshot and get instant forensic analysis with trust score
                </motion.p>
              </div>

              {/* Upload Zone */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  {...getRootProps()}
                  className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive ? 'border-purple-500 bg-purple-500/20 scale-105' : 'hover:border-purple-500/50 hover:scale-[1.02]'
                  }`}
                >
                  <input {...getInputProps()} />
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-2xl" />
                      <p className="text-gray-300">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-400">Click or drag to change</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-6xl animate-float">📸</div>
                      <p className="text-xl font-semibold text-white">
                        {isDragActive ? 'Drop your screenshot here' : 'Drag & drop payment screenshot'}
                      </p>
                      <p className="text-gray-400">or click to browse</p>
                      <p className="text-sm text-gray-500">Supports PNG, JPG • Max 10MB</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Analyze Button */}
              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mt-8"
                >
                  <button
                    onClick={handleAnalyze}
                    className="btn-gradient text-lg px-8 py-3 flex items-center gap-2"
                  >
                    <span>🔍</span>
                    Analyze Screenshot
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="mt-6 text-xl text-white font-semibold">Analyzing screenshot...</p>
              <p className="text-gray-400 mt-2">Running forensic checks</p>
              <div className="flex gap-4 mt-6">
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ELA Analysis
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  OCR Extraction
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Structural Check
                </span>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {result && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6"
              ref={resultsRef}
            >
              {/* Trust Score Card */}
              <div className="glass-card p-8 text-center">
                <h3 className="text-gray-300 text-lg mb-4">Trust Score</h3>
                <div className="relative inline-block">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 88}
                      strokeDashoffset={2 * Math.PI * 88 * (1 - result.trust_score / 100)}
                      className="text-purple-500"
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">{result.trust_score}</span>
                    <span className="text-gray-400 text-sm">/ 100</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    result.trust_score >= 80 ? 'bg-green-500/20 text-green-400' :
                    result.trust_score >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {result.trust_score >= 80 ? 'Low Risk' :
                     result.trust_score >= 50 ? 'Medium Risk' :
                     'High Risk'}
                  </span>
                </div>
              </div>

              {/* Heatmap Visualization */}
              {heatmapUrl && (
                <div className="glass-card p-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🔥</span> Visual Analysis
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-2 text-center">Original Screenshot</p>
                      <img src={previewUrl} alt="Original" className="rounded-lg w-full border border-white/10" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2 text-center">
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                        Suspicious Regions (Heatmap)
                      </p>
                      <img src={heatmapUrl} alt="Heatmap" className="rounded-lg w-full border border-white/10" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Red regions indicate potential manipulation detected by ELA analysis
                  </p>
                </div>
              )}

              {/* Analysis Reasons */}
              <div className="glass-card p-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>⚠️</span> Analysis Reasons
                </h3>
                <div className="space-y-3">
                  {result.reasons && result.reasons.length > 0 ? (
                    result.reasons.map((reason, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                      >
                        <span className="text-red-400 mt-0.5">✗</span>
                        <span className="text-gray-300 text-sm">{reason}</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="text-green-400">✓ No significant anomalies detected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted Data */}
              {result.extracted_data && (
                <div className="glass-card p-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>📋</span> Extracted Transaction Data
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(result.extracted_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-white font-mono">{value || 'Not detected'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors Summary */}
              {result.risk_factors && result.risk_factors.length > 0 && (
                <div className="glass-card p-8 border-red-500/30">
                  <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                    <span>🚨</span> Risk Factors Identified
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.risk_factors.map((factor, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Download PDF Button */}
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generatePDF}
                  className="btn-gradient px-6 py-3 flex items-center gap-2"
                >
                  <span>📄</span>
                  Download Report (PDF)
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 border-t border-white/10 mt-12">
        <p className="text-gray-400 text-sm">
          🔒 ProofChain analyzes screenshot integrity using forensic techniques (ELA, OCR, Structural Analysis).
          Does not verify actual payment settlement. For high-risk transactions, verify with bank confirmation.
        </p>
      </footer>
    </div>
  );
};

export default App;