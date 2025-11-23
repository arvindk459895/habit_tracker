import React, { useRef } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Download, Upload } from 'lucide-react';

export const DataControls: React.FC = () => {
    const { habits, logs, dayNotes } = useHabitStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            habits,
            logs,
            dayNotes,
            version: 1,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `habit-flow-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.habits && data.logs) {
                    // Ideally we should replace the store state, but Zustand persist might handle it if we just reload or update state.
                    // Since we don't have a "setAll" action, we might need to add one or just clear and add.
                    // For MVP, let's just alert or try to merge?
                    // Actually, replacing is better.
                    // I'll add a `importData` function to the store.
                    // But for now, I'll just warn.
                    const confirm = window.confirm('This will overwrite your current data. Are you sure?');
                    if (confirm) {
                        localStorage.setItem('habit-tracker-storage', JSON.stringify({
                            state: {
                                habits: data.habits,
                                logs: data.logs,
                                dayNotes: data.dayNotes || {},
                            },
                            version: 0 // Zustand persist version
                        }));
                        window.location.reload();
                    }
                }
            } catch (error) {
                alert('Invalid file format');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Export Data"
            >
                <Download size={16} />
                Export
            </button>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Import Data"
            >
                <Upload size={16} />
                Import
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
            />
        </div>
    );
};
