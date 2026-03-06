import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { renderTable } from '../utils/tableLog';

export const DataTableTab = () => {
    const components = useAppStore(state => state.components);
    const updateComponentAttribute = useAppStore(state => state.updateComponentAttribute);
    const updateComponentPoint = useAppStore(state => state.updateComponentPoint);
    const setPcfText = useAppStore(state => state.setPcfText);
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && components && components.length > 0) {
            renderTable(containerRef.current, components);
        } else if (containerRef.current) {
            containerRef.current.innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8">No PCF data loaded. Please load a PCF file in the 3D Viewer tab first.</div>';
        }
    }, [components]);

    // Handle table edits updating our local state if we want persistence across unmounts
    useEffect(() => {
        const handleEdit = (e) => {
            const { id, field, value } = e.detail;
            console.log("Table edited: ", { id, field, value });

            const compIndex = components.findIndex(c =>
                (c.attributes?.REFNO === id) ||
                (c.attributes?.['PIPELINE-REFERENCE'] === id) ||
                (c.attributes?.['COMPONENT-ATTRIBUTE97'] === id)
            );

            if (compIndex > -1) {
                if (field.startsWith('Start ') || field.startsWith('End ')) {
                    const isStart = field.startsWith('Start');
                    const prop = field.endsWith('X') ? 'x' : field.endsWith('Y') ? 'y' : 'z';
                    updateComponentPoint(compIndex, isStart ? 0 : 1, prop, value);
                } else {
                    // Map UI Field back to CA
                    let destField = field;
                    if (field.includes('(ATTR')) {
                        destField = 'COMPONENT-ATTRIBUTE' + field.split('(ATTR')[1].replace(')', '');
                    } else if (field === 'Line No. (Derived)') {
                        destField = 'PIPELINE-REFERENCE';
                    }
                    updateComponentAttribute(compIndex, destField, value);
                }
            }
        };

        document.addEventListener('pcf-table-edit', handleEdit);
        return () => document.removeEventListener('pcf-table-edit', handleEdit);
    }, [components, updateComponentAttribute, updateComponentPoint]);

    const handleRefreshPcf = () => {
        import('../utils/pcfSerializer').then(({ serializePcf }) => {
            const newPcf = serializePcf(components);
            setPcfText(newPcf);
            alert("PCF Text successfully regenerated from the table and synced to the Viewer tab.");
        });
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 z-10 w-full">
                <div className="flex items-center gap-4">
                    <span className="text-slate-300 text-sm font-medium">
                        Data Table View
                    </span>
                    <span className="text-slate-400 text-xs">
                        {components.length} rows
                    </span>
                </div>
                <div>
                    <button
                        onClick={handleRefreshPcf}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded shadow transition-colors"
                    >
                        ⚙️ Regenerate PCF text
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-slate-900 custom-scrollbar"
                style={{ position: 'relative' }}
            >
                {/* renderTable injects HTML here */}
            </div>
        </div>
    );
};

export default DataTableTab;
