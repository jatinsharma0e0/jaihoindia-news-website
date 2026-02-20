import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GalleryImage } from '@/services/api';
import type { SortMode } from './ArrangementToolbar';

// ─── Single draggable card ──────────────────────────────────────────────────

interface SortableCardProps {
    image: GalleryImage;
    isSelected: boolean;
    isDragEnabled: boolean;
    overlayIcon?: React.ReactNode;
    onToggleSelect: (id: string | number) => void;
    onDelete: (id: string | number) => void;
}

function SortableCard({
    image,
    isSelected,
    isDragEnabled,
    overlayIcon,
    onToggleSelect,
    onDelete,
}: SortableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id, disabled: !isDragEnabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative aspect-square rounded-lg overflow-hidden border bg-slate-800 transition-all ${isSelected ? 'border-news-red ring-2 ring-news-red/50' : 'border-slate-700'
                } ${isDragging ? 'shadow-2xl scale-105' : ''}`}
        >
            {/* Drag handle — only visible in custom mode */}
            {isDragEnabled && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-1.5 right-1.5 z-20 p-1 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="w-4 h-4 text-white" />
                </div>
            )}

            {/* Image */}
            <img
                src={image.image_url}
                alt="item"
                className="w-full h-auto object-contain pointer-events-none"
            />

            {/* Click overlay for selection */}
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => onToggleSelect(image.id)}
            />

            {/* Selection checkbox */}
            <div className={`absolute top-1.5 left-1.5 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {isSelected
                    ? <CheckSquare className="w-5 h-5 text-news-red drop-shadow-lg" />
                    : <Square className="w-5 h-5 text-white drop-shadow-lg" />}
            </div>

            {/* Hover overlay with optional section icon + delete */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-3 gap-1 pointer-events-none">
                {overlayIcon && <div className="text-white opacity-70">{overlayIcon}</div>}
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onDelete(image.id); }}
                    className="scale-90 hover:scale-100 transition-transform pointer-events-auto"
                >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                </Button>
            </div>
        </div>
    );
}

// ─── Sortable Grid ──────────────────────────────────────────────────────────

interface SortableImageGridProps {
    images: GalleryImage[];
    sortMode: SortMode;
    selected: Set<string | number>;
    overlayIcon?: React.ReactNode;
    emptyMessage?: string;
    onReorder: (newImages: GalleryImage[]) => void;
    onToggleSelect: (id: string | number) => void;
    onDelete: (id: string | number) => void;
}

export default function SortableImageGrid({
    images,
    sortMode,
    selected,
    overlayIcon,
    emptyMessage = 'No items yet',
    onReorder,
    onToggleSelect,
    onDelete,
}: SortableImageGridProps) {
    const isDragEnabled = sortMode === 'custom';

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = images.findIndex((img) => img.id === active.id);
        const newIndex = images.findIndex((img) => img.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = [...images];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);
        onReorder(reordered);
    };

    if (images.length === 0) {
        return (
            <div className="col-span-full py-12 text-center border border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <SortableCard
                            key={image.id}
                            image={image}
                            isSelected={selected.has(image.id)}
                            isDragEnabled={isDragEnabled}
                            overlayIcon={overlayIcon}
                            onToggleSelect={onToggleSelect}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
