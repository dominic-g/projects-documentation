import * as React from 'react';
import * as TablerIcons from '@tabler/icons-react';


// export function getIconComponent(iconName: string): React.FC<{ size: number }> | undefined {
export function getIconComponent(iconName: string): React.FC<Partial<{ size: number }>> | undefined {
    if (!iconName) return undefined;
    const Icon = (TablerIcons as any)[iconName];
    return Icon || undefined; 
}