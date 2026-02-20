import { ArrowDownAZ, ArrowUpAZ, Clock, Clock3, GripVertical, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SortMode = 'newest' | 'oldest' | 'az' | 'za' | 'custom';

interface ArrangementToolbarProps {
    sortMode: SortMode;
    onSortModeChange: (mode: SortMode) => void;
    hasUnsavedOrder: boolean;
    isSaving: boolean;
    onSave: () => void;
}

const PRESETS: { mode: SortMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'newest', label: 'Newest First', icon: <Clock className="w-3.5 h-3.5" /> },
    { mode: 'oldest', label: 'Oldest First', icon: <Clock3 className="w-3.5 h-3.5" /> },
    { mode: 'az', label: 'A → Z', icon: <ArrowDownAZ className="w-3.5 h-3.5" /> },
    { mode: 'za', label: 'Z → A', icon: <ArrowUpAZ className="w-3.5 h-3.5" /> },
    { mode: 'custom', label: 'Manual', icon: <GripVertical className="w-3.5 h-3.5" /> },
];

export default function ArrangementToolbar({
    sortMode,
    onSortModeChange,
    hasUnsavedOrder,
    isSaving,
    onSave,
}: ArrangementToolbarProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mr-1 whitespace-nowrap">
                Sort Order
            </span>
            <div className="flex items-center gap-1 flex-wrap">
                {PRESETS.map(({ mode, label, icon }) => (
                    <button
                        key={mode}
                        onClick={() => onSortModeChange(mode)}
                        className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
                            sortMode === mode
                                ? 'bg-news-red text-white shadow-md shadow-red-900/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        )}
                    >
                        {icon}
                        {label}
                    </button>
                ))}
            </div>
            {sortMode === 'custom' && hasUnsavedOrder && (
                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving}
                    className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3"
                >
                    {isSaving
                        ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        : <Save className="w-3.5 h-3.5 mr-1" />}
                    {isSaving ? 'Saving…' : 'Save Order'}
                </Button>
            )}
            {sortMode === 'custom' && !hasUnsavedOrder && (
                <span className="ml-auto text-xs text-slate-500 italic">
                    Drag cards to reorder
                </span>
            )}
        </div>
    );
}
