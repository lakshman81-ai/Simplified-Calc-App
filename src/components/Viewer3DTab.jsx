import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { PcfViewer3D } from '../utils/viewer3d';
import { parsePcf } from '../utils/pcfParser';
import { log } from '../utils/logger';

export const Viewer3DTab = () => {
  const components = useAppStore(state => state.components);
  const setComponents = useAppStore(state => state.setComponents);
  const pcfText = useAppStore(state => state.pcfText);
  const setPcfText = useAppStore(state => state.setPcfText);
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    setPcfText(text); // Just load it into the textarea
    event.target.value = '';
  };

  const handleClear = () => {
    setPcfText('');
    setComponents([]);
  };

  const handleGenerate3D = () => {
    if (!pcfText.trim()) {
      alert("Please paste or load PCF text first.");
      return;
    }
    const parsedComponents = parsePcf(pcfText);
    log('info', 'Viewer3DTab', `PCF parsed from text`, { count: parsedComponents.length });

    if (parsedComponents.length > 0) {
      setComponents(parsedComponents);
    } else {
      alert("No valid pipe components found in PCF text.");
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize viewer if not exists
    if (!viewerRef.current) {
      viewerRef.current = new PcfViewer3D(containerRef.current);
    }

    // Pass data to viewer whenever components change
    if (viewerRef.current) {
      viewerRef.current.render(components);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, [components]);

  return (
    <div className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden p-3 gap-3 h-full">

      {/* Main Split Layout container */}
      <div className="flex flex-row gap-3 flex-1 min-h-0 w-full">

        {/* Left Side: PCF Input Panel */}
        <div className="w-[320px] flex flex-col shrink-0 bg-white border border-slate-300 rounded overflow-hidden shadow-sm h-full">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] border-b border-slate-200">
            <span className="text-slate-600 font-semibold text-xs tracking-wider uppercase mr-auto mt-1">PCF Input</span>

            <label
              title="Open a .pcf file from disk"
              className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs rounded cursor-pointer transition-colors shadow-sm"
            >
              📂
              <input type="file" accept=".pcf,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              title="Clear scene and reset"
              className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs rounded transition-colors shadow-sm"
              onClick={handleClear}
            >
              🗑
            </button>
          </div>

          <div className="flex-1 flex flex-col bg-white p-0 relative">
            <textarea
              value={pcfText}
              onChange={(e) => setPcfText(e.target.value)}
              placeholder="Paste PCF content here, or click 📂 to open a file..."
              className="absolute inset-0 w-full h-full bg-transparent text-[#21808e] font-mono text-[11px] leading-tight p-3 outline-none resize-none custom-scrollbar whitespace-pre"
            />
          </div>

          <div className="p-2 border-t border-slate-200 flex items-center bg-[#f8fafc]">
            <button
              onClick={handleGenerate3D}
              className="w-full px-3 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded shadow-sm transition-colors"
            >
              ▶ Generate 3D
            </button>
          </div>
        </div>

        {/* Right Side: Visualization Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-300 rounded shadow-sm overflow-hidden">

          {/* Top Viewer Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 bg-[#f8fafc] border-b border-slate-200">

            <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 mr-2">
              <button className="px-3 py-1 bg-[#ffa500] text-white shadow-sm rounded-sm text-[11px] font-bold flex items-center gap-1">
                <span className="text-[12px]">🧊</span> 3D View
              </button>
              <button className="px-3 py-1 text-slate-500 hover:text-slate-700 text-[11px] font-medium flex items-center gap-1">
                <span className="text-[12px]">📊</span> 3DV Data Table
              </button>
              <button
                onClick={() => viewerRef.current?.fitCamera()}
                className="px-3 py-1 text-slate-500 hover:text-slate-700 text-[11px] font-medium flex items-center gap-1 border-l border-slate-200 ml-1 pl-2"
              >
                <span>⊙</span> Centre
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button className="px-3 py-1 bg-white border border-slate-300 text-slate-600 text-[11px] rounded font-medium shadow-sm hover:bg-slate-50 flex items-center gap-1">
                <span>⛶</span> Full Screen
              </button>
              <button className="px-3 py-1 bg-[#10b981] text-white text-[11px] rounded font-semibold shadow-sm hover:bg-[#059669]">
                ↓ Export as PCF
              </button>
              <button className="px-3 py-1 bg-[#8b5cf6] text-white text-[11px] rounded font-semibold shadow-sm hover:bg-[#7c3aed]">
                ⚙️ Apply Fixing Action
              </button>
              <button className="px-2 py-1 bg-white border border-slate-300 text-slate-600 text-[11px] rounded font-medium shadow-sm hover:bg-slate-50">
                ⎘ Copy
              </button>
            </div>

          </div>

          {/* Status Bar */}
          <div className="px-3 py-1 bg-white text-right border-b border-slate-100 flex justify-end">
            <span className="text-[#10b981] text-[10px] font-medium">✓ {components.length} components rendered.</span>
          </div>

          <div
            ref={containerRef}
            className="flex-1 relative bg-[#1c2030] overflow-hidden"
          >
            {/* Three.js canvas goes here */}
            {components.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-slate-500 text-xs font-medium bg-[#1c2030]/80 px-3 py-1.5 rounded">Paste PCF or open file, then click Generate 3D.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Viewer3DTab;
