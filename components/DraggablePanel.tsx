
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '../constants';
import { useTheme } from '../hooks/useTheme';

interface DraggablePanelProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({ id, children, className = '' }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const { theme } = useTheme();
    const isDark = theme.name.includes('Dark');
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };
    
    const themeClasses = `${isDark ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-xl shadow-lg border ${isDark ? 'border-white/10' : 'border-white/40'}`;

    return (
        <div ref={setNodeRef} style={style} className={`relative group rounded-xl hover:shadow-2xl transition-all touch-none text-text ${themeClasses} ${className} transform hover:-translate-y-1.5`}>
            <button 
                {...listeners} 
                {...attributes} 
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 p-2 text-text/60 hover:text-text cursor-grab focus:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full z-20" 
                aria-label="Drag to reorder"
            >
                <Bars3Icon className="w-5 h-5"/>
            </button>
            {children}
        </div>
    );
};

export default DraggablePanel;
