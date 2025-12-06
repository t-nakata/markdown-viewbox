import { ViewElement, ViewBoxRoot, ScreenConfig, BaseElement } from './types';

interface LayoutNode {
    element: ViewElement;
    x: number;
    y: number;
    width: number;
    height: number;
    children?: LayoutNode[];
}

// Material Design Constants
const MD_COLORS = {
    primary: '#6200EE',
    primaryVariant: '#3700B3',
    secondary: '#03DAC6',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#B00020',
    onPrimary: '#FFFFFF',
    onSurface: '#000000',
    textPrimary: 'rgba(0, 0, 0, 0.87)',
    textSecondary: 'rgba(0, 0, 0, 0.60)',
    border: 'rgba(0, 0, 0, 0.12)',
    appBar: '#6200EE',
    bottomNav: '#FFFFFF'
};

const MD_SHADOWS = {
    elevation2: 'filter="url(#shadow-2)"',
    elevation4: 'filter="url(#shadow-4)"',
    elevation8: 'filter="url(#shadow-8)"'
};

const DEFAULT_FONT_SIZE = 16;
const LINE_HEIGHT = 1.5;

function measureText(text: string, size: number = DEFAULT_FONT_SIZE, weight: string = 'normal'): { width: number, height: number } {
    const len = text.length;
    const w = len * (size * 0.6);
    return { width: w, height: size * LINE_HEIGHT };
}

function calculateLayout(
    element: ViewElement,
    x: number,
    y: number,
    availableWidth: number,
    availableHeight: number // Added context for Scaffold
): LayoutNode {
    let width = 0;
    let height = 0;
    let childrenNodes: LayoutNode[] = [];

    const padding = element.padding || 0;
    const gap = element.gap || 0;
    const contentWidth = availableWidth - (padding * 2);

    // Layout Logic
    if (element.type === 'Scaffold') {
        width = availableWidth;
        height = availableHeight;
        const scaffoldEl = element as any;

        // 1. AppBar
        let contentY = y;
        if (scaffoldEl.appBar) {
            contentY += 56;
        }

        // 2. BottomNavigation (Fixed at bottom)
        let contentBottom = y + height;
        if (scaffoldEl.bottomNavigation) {
            contentBottom -= 56;
            // Layout Bottom Nav
            childrenNodes.push({
                element: scaffoldEl.bottomNavigation,
                x: x,
                y: contentBottom,
                width: width,
                height: 56
            });
        }

        // 3. Body
        const bodyHeight = contentBottom - contentY;
        if (scaffoldEl.body) {
            const bodyNode = calculateLayout(scaffoldEl.body, x, contentY, width, bodyHeight);
            childrenNodes.push(bodyNode);
        }

        // 4. FAB (Fixed absolute)
        if (scaffoldEl.floatingActionButton) {
            // Bottom Right
            const fabSize = 56;
            const fabMargin = 16;
            const fabX = width - fabSize - fabMargin;
            const fabY = contentBottom - fabSize - fabMargin - (scaffoldEl.bottomNavigation ? 0 : 0); // FAB usually above BottomNav or overlapping? Material guidelines: above snackbar, can overlap content.
            // If bottom nav is present, usually FAB is above it
            // Let's place it nicely.

            childrenNodes.push({
                element: scaffoldEl.floatingActionButton,
                x: fabX,
                y: fabY,
                width: fabSize,
                height: fabSize
            });
        }

    } else if (element.type === 'Container' || element.type === 'VBox' || element.type === 'Column') {
        let currentY = y + padding;
        let currentX = x + padding;
        let maxWidth = 0;

        if (element.children) {
            for (const child of element.children) {
                const node = calculateLayout(child as ViewElement, currentX, currentY, contentWidth, 0); // unlimited height for children unless constrained
                childrenNodes.push(node);
                currentY += node.height + gap;
                maxWidth = Math.max(maxWidth, node.width);
            }
            if (element.children.length > 0) currentY -= gap;
        }

        height = (currentY - y) + padding;
        width = availableWidth;

        if (element.height) height = Number(element.height);
        if (element.width) width = Number(element.width);

    } else if (element.type === 'Text') {
        const textData = element as any;
        const dims = measureText(textData.text, textData.size, textData.weight);
        width = dims.width;
        height = dims.height;

    } else if (element.type === 'Button') {
        const btnData = element as any;
        const dims = measureText(btnData.text || 'Button', 14);
        width = Math.max(64, dims.width + 32);
        height = 36;
    } else if (element.type === 'EditText' || element.type === 'Input') {
        width = contentWidth;
        height = 56;
    } else {
        width = 100;
        height = 100;
    }

    return {
        element,
        x,
        y,
        width,
        height,
        children: childrenNodes
    };
}

function renderNodeToSVG(node: LayoutNode): string {
    let svg = '';
    const { x, y, width, height, element } = node;

    if (element.type === 'Scaffold') {
        const scaffoldEl = element as any;

        // AppBar
        if (scaffoldEl.appBar) {
            svg += `<g filter="url(#shadow-4)">
         <rect x="${x}" y="${y}" width="${width}" height="56" fill="${MD_COLORS.appBar}"/>
         <text x="${x + 16}" y="${y + 35}" fill="#FFFFFF" font-family="'Roboto', sans-serif" font-size="20" font-weight="500">${scaffoldEl.appBar.title || ''}</text>
       </g>`;
        }

        if (node.children) {
            // Render children (body, bottomNav, fab)
            // Be careful with Z-order. Body first, then floating elements.
            // Our layout array order is BottomNav, Body, FAB. 
            // We should render Body, then BottomNav, then FAB to ensure z-index.
            // Actually layout calculation pushed BottomNav first.. 
            // Let's rely on array order but verify.

            // Sort: Body -> BottomNav -> FAB
            const sorted = [...node.children].sort((a, b) => {
                const score = (type: string) => {
                    if (type === 'Container' || type === 'Column') return 0;
                    if (type === 'BottomNavigation') return 10;
                    if (type === 'FloatingActionButton') return 20;
                    return 5;
                };
                return score(a.element.type) - score(b.element.type);
            });

            svg += sorted.map(renderNodeToSVG).join('\n');
        }
    }
    else if (element.type === 'Container' || element.type === 'VBox' || element.type === 'Column') {
        const containerEl = element as any;
        if (containerEl.color) {
            svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${containerEl.color}"/>`;
        }
        if (node.children) {
            svg += node.children.map(renderNodeToSVG).join('\n');
        }
    } else if (element.type === 'BottomNavigation') {
        const btmEl = element as any;
        svg += `<g transform="translate(${x}, ${y})" filter="url(#shadow-8)">
        <rect width="${width}" height="${height}" fill="${MD_COLORS.bottomNav}"/>`;

        const count = btmEl.items.length;
        const itemWidth = width / count;
        btmEl.items.forEach((item: any, i: number) => {
            const ix = i * itemWidth;
            const color = item.active ? MD_COLORS.primary : MD_COLORS.textSecondary;
            // Icon mock (circle)
            svg += `<circle cx="${ix + itemWidth / 2}" cy="20" r="10" fill="${color}" opacity="0.2"/>`;
            // Label
            svg += `<text x="${ix + itemWidth / 2}" y="44" text-anchor="middle" fill="${color}" font-family="'Roboto', sans-serif" font-size="12">${item.label}</text>`;
        });
        svg += `</g>`;

    } else if (element.type === 'FloatingActionButton') {
        const fabEl = element as any;
        svg += `<g transform="translate(${x}, ${y})" filter="url(#shadow-8)">
         <circle cx="${width / 2}" cy="${height / 2}" r="${width / 2}" fill="${MD_COLORS.secondary}"/>
         <text x="${width / 2}" y="${height / 2 + 6}" text-anchor="middle" fill="#000" font-family="'Roboto', sans-serif" font-size="24">${fabEl.icon || '+'}</text>
      </g>`;

    } else if (element.type === 'Text') {
        const textEl = element as any;
        const fontSize = textEl.size || DEFAULT_FONT_SIZE;
        const fontWeight = textEl.weight || 'normal';
        const fill = textEl.color || MD_COLORS.textPrimary;
        const fontFamily = "'Roboto', 'Segoe UI', sans-serif";
        svg += `<text x="${x}" y="${y + fontSize}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}">${textEl.text}</text>`;

    } else if (element.type === 'Button') {
        const btnEl = element as any;
        const isPrimary = btnEl.variant === 'primary' || !btnEl.variant;
        const bgColor = isPrimary ? MD_COLORS.primary : MD_COLORS.surface;
        const textColor = isPrimary ? MD_COLORS.onPrimary : MD_COLORS.primary;
        const stroke = isPrimary ? 'none' : `stroke="${MD_COLORS.border}"`;

        svg += `<g transform="translate(${x}, ${y})" ${isPrimary ? MD_SHADOWS.elevation2 : ''}>
      <rect width="${width}" height="${height}" rx="4" fill="${bgColor}" ${stroke}/>
      <text x="${width / 2}" y="${height / 2 + 5}" text-anchor="middle" fill="${textColor}" font-family="'Roboto', sans-serif" font-size="14" font-weight="500" style="text-transform: uppercase; letter-spacing: 1.25px;">${btnEl.text}</text>
    </g>`;

    } else if (element.type === 'EditText' || element.type === 'Input') {
        const inputEl = element as any;
        const borderColor = MD_COLORS.textSecondary;
        const label = inputEl.label || inputEl.hint || inputEl.placeholder || '';

        svg += `<g transform="translate(${x}, ${y})">
      <rect width="${width}" height="${height}" rx="4" fill="none" stroke="${borderColor}" stroke-width="1"/>
      <text x="12" y="12" fill="${MD_COLORS.textSecondary}" font-family="'Roboto', sans-serif" font-size="12" style="background: white">${label ? ' ' + label + ' ' : ''}</text>
       <text x="16" y="${height / 2 + 5}" fill="${MD_COLORS.textPrimary}" font-family="'Roboto', sans-serif" font-size="16">${inputEl.value || ''}</text>
    </g>`;
    }

    return svg;
}

export function render(config: ScreenConfig & { title?: string }, root: ViewBoxRoot['root']): string {
    const width = config.width || 800;
    const height = config.height || 600;

    // Layout Pass
    const rootLayout = calculateLayout(root, 0, 0, width, height);

    // Render Pass
    const content = renderNodeToSVG(rootLayout);

    const defs = `
    <defs>
      <filter id="shadow-2" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.2"/>
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.12"/>
        <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#000" flood-opacity="0.14"/>
      </filter>
      <filter id="shadow-4" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.2"/>
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.14"/>
        <feDropShadow dx="0" dy="1" stdDeviation="10" flood-color="#000" flood-opacity="0.12"/>
      </filter>
      <filter id="shadow-8" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.2"/>
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.14"/>
        <feDropShadow dx="0" dy="3" stdDeviation="14" flood-color="#000" flood-opacity="0.12"/>
      </filter>
    </defs>
  `;

    let statusBar = '';
    let contentOffsetY = 0;

    if (config.size === 'Mobile') {
        contentOffsetY = 24;
        statusBar = `<rect width="${width}" height="${contentOffsetY}" fill="#E0E0E0"/>
                   <text x="14" y="16" font-family="'Roboto', sans-serif" font-size="12" fill="#000">9:41</text>`;
    }

    // Clip contentOffsetY?? Scaffold handles its own layout from Y=0 usually. 
    // But our scaffold assumes full height. 
    // If Mobile, we shifted content down by 24. Scaffold should probably respect that or we just wrap it.

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${defs}
  <rect width="${width}" height="${height}" fill="${MD_COLORS.background}"/>
  ${statusBar}
  <g transform="translate(0, ${contentOffsetY})">
    ${content}
  </g>
</svg>
`;
}
