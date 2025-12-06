import yaml from 'js-yaml';
import { ViewBoxRoot, ScreenConfig } from './types';

export const SCREEN_PRESETS: Record<string, { width: number; height: number }> = {
    Web: { width: 1280, height: 800 },
    Mobile: { width: 375, height: 812 },
    // Custom defaults
    Custom: { width: 800, height: 600 },
};

export function parse(source: string): { config: ScreenConfig & { title?: string }, root: ViewBoxRoot['root'] } {
    const doc = yaml.load(source) as ViewBoxRoot;

    if (!doc || typeof doc !== 'object') {
        throw new Error('Invalid YAML: Root must be an object.');
    }

    const screenType = doc.screen || 'Web';
    let width = doc.width;
    let height = doc.height;

    if (screenType !== 'Custom') {
        const preset = SCREEN_PRESETS[screenType];
        if (preset) {
            width = preset.width;
            height = preset.height;
        }
    }

    // Fallback if custom but no dimensions
    if (screenType === 'Custom') {
        width = width || SCREEN_PRESETS.Custom.width;
        height = height || SCREEN_PRESETS.Custom.height;
    }

    return {
        config: {
            size: screenType,
            width: width!,
            height: height!,
            title: doc.title
        },
        root: doc.root
    };
}
