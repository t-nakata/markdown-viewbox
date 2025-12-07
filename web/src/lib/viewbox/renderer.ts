import { ViewElement, ViewBoxRoot, ScreenConfig, BaseElement } from './types';

interface LayoutNode {
    element: ViewElement;
    x: number;
    y: number;
    width: number;
    height: number;
    children?: LayoutNode[];
    path: string; // Added path tracking
    textLines?: string[]; // Added for text wrapping
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
    textHint: 'rgba(0, 0, 0, 0.38)',
    border: 'rgba(0, 0, 0, 0.12)',
    appBar: '#6200EE',
    bottomNav: '#FFFFFF',
    link: '#1E88E5'
};

const MD_SHADOWS = {
    elevation2: 'filter="url(#shadow-2)"',
    elevation4: 'filter="url(#shadow-4)"',
    elevation8: 'filter="url(#shadow-8)"'
};

const DEFAULT_FONT_SIZE = 16;
const LINE_HEIGHT = 1.5;

// Minimal SVG Path Map for Icons
const ICON_PATHS: Record<string, string> = {
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.08-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    arrow_back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 17.59 13.41 12z',
    image: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'
};

function getIconPath(name: string): string {
    return ICON_PATHS[name] || '';
}

function measureText(text: string, size: number = DEFAULT_FONT_SIZE, weight: string = 'normal', maxWidth: number = 1000): { width: number, height: number, lines: string[] } {
    const charWidth = size * 0.6;
    const words = text.split(' ');
    let lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = (currentLine.length + 1 + word.length) * charWidth;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);

    // Calculate max width of lines
    const maxLineWidth = Math.max(...lines.map(line => line.length * charWidth));

    return {
        width: Math.min(maxWidth, maxLineWidth),
        height: lines.length * (size * LINE_HEIGHT),
        lines
    };
}

function calculateLayout(
    element: ViewElement,
    x: number,
    y: number,
    availableWidth: number,
    availableHeight: number,
    safeAreaBottom: number = 0,
    path: string = 'root'
): LayoutNode {
    let width = 0;
    let height = 0;
    let childrenNodes: LayoutNode[] = [];

    const padding = element.padding || 0;
    const gap = element.gap || 0;
    const contentWidth = availableWidth - (padding * 2);

    if (element.type === 'Scaffold') {
        width = availableWidth;
        height = availableHeight;
        const scaffoldEl = element as any;

        // 1. AppBar
        let contentY = y;
        if (scaffoldEl.appBar) {
            contentY += 56;
        }

        // 2. BottomNavigation
        let contentBottom = y + height;

        // BottomNav takes 72px + Safe Area Bottom.
        const navContentHeight = 72;
        const navFullHeight = navContentHeight + safeAreaBottom;

        if (scaffoldEl.bottomNavigation) {
            contentBottom -= navFullHeight;

            const btmEl = scaffoldEl.bottomNavigation;
            let navChildren: LayoutNode[] = [];

            if (btmEl.children) {
                const count = btmEl.children.length;
                const itemWidth = width / count;

                navChildren = btmEl.children.map((child: any, i: number) => {
                    return calculateLayout(child, x + (i * itemWidth), contentBottom, itemWidth, navContentHeight, 0, `${path}.bottomNavigation.children.${i}`);
                });
            }

            childrenNodes.push({
                element: scaffoldEl.bottomNavigation,
                x: x,
                y: contentBottom,
                width: width,
                height: navFullHeight,
                children: navChildren,
                path: `${path}.bottomNavigation`
            });
        }

        // 3. Body
        const bodyHeight = contentBottom - contentY;
        if (scaffoldEl.body) {
            const bodyNode = calculateLayout(scaffoldEl.body, x, contentY, width, bodyHeight, 0, `${path}.body`);
            childrenNodes.push(bodyNode);
        }

        // 4. FAB
        if (scaffoldEl.floatingActionButton) {
            const fabSize = 56;
            const fabMargin = 16;
            const fabX = width - fabSize - fabMargin;
            const fabY = contentBottom - fabSize - fabMargin - (scaffoldEl.bottomNavigation ? 16 : 0);

            childrenNodes.push({
                element: scaffoldEl.floatingActionButton,
                x: fabX,
                y: fabY,
                width: fabSize,
                height: fabSize,
                path: `${path}.floatingActionButton`
            });
        }

    } else if (element.type === 'Container') {
        let currentY = y + padding;
        let currentX = x + padding;

        if (element.child) {
            const node = calculateLayout(element.child as ViewElement, currentX, currentY, contentWidth, 0, 0, `${path}.child`);
            childrenNodes.push(node);
            height = node.height + (padding * 2);
            width = Math.max(availableWidth, node.width + (padding * 2));
        } else {
            // Empty container
            width = availableWidth;
            height = 100; // Default height if empty and no dimension
        }

        if (element.height) height = Number(element.height);
        if (element.width) width = Number(element.width);

    } else if (element.type === 'Column' || element.type === 'VBox') {
        let currentY = y + padding;
        let currentX = x + padding;
        let maxWidth = 0;

        if (element.children) {
            element.children.forEach((child, i) => {
                const node = calculateLayout(child as ViewElement, currentX, currentY, contentWidth, 0, 0, `${path}.children.${i}`);
                childrenNodes.push(node);
                currentY += node.height + gap;
                maxWidth = Math.max(maxWidth, node.width);
            });
            if (element.children.length > 0) currentY -= gap;
        }

        height = (currentY - y) + padding;
        width = availableWidth; // Take full width usually

        if (element.height) height = Number(element.height);
        if (element.width) width = Number(element.width);

    } else if (element.type === 'Row') {
        let currentY = y + padding;
        let currentX = x + padding;
        let maxHeight = 0;

        // Simple row layout: auto-width for children
        // We don't have expanded logic yet, so just stack left-to-right

        if (element.children) {
            element.children.forEach((child, i) => {
                // For now, give child unlimited width or remaining width?
                // Let's give remaining.
                const remaining = availableWidth - (currentX - x);
                const node = calculateLayout(child as ViewElement, currentX, currentY, remaining, 0, 0, `${path}.children.${i}`);
                childrenNodes.push(node);

                currentX += node.width + gap;
                maxHeight = Math.max(maxHeight, node.height);
            });
            if (element.children.length > 0) currentX -= gap;
        }

        width = availableWidth;
        height = maxHeight + (padding * 2);

        if (element.height) height = Number(element.height);
        if (element.width) width = Number(element.width);

    } else if (element.type === 'BottomNavigationItem') {
        width = availableWidth;
        height = availableHeight;

    } else if (element.type === 'Text' || element.type === 'Link') {
        const textData = element as any;
        // Use availableWidth as maxWidth constraint
        const dims = measureText(textData.text || '', textData.size || DEFAULT_FONT_SIZE, textData.weight || 'normal', availableWidth);
        width = dims.width;
        height = dims.height;
        // Store the calculated lines for rendering
        return { element, x, y, width, height, children: childrenNodes, path, textLines: dims.lines };

    } else if (element.type === 'Button') {
        const btnData = element as any;
        const dims = measureText(btnData.text || 'Button', 14, 'bold', availableWidth); // Button usually single line but good to check
        width = Math.max(64, dims.width + 32);
        height = 36;
        if (btnData.width) width = Number(btnData.width); // Allow override

    } else if (element.type === 'EditText' || element.type === 'Input') {
        width = contentWidth;
        height = 56; // Standard Material Height
    } else if (element.type === 'Icon') {
        const iconEl = element as any;
        width = iconEl.size || 24;
        height = iconEl.size || 24;
    } else if (element.type === 'Image') {
        const imgEl = element as any;
        width = imgEl.width ? Number(imgEl.width) : availableWidth;
        height = imgEl.height ? Number(imgEl.height) : 200;
    } else {
        width = 100;
        height = 100;
    }

    return { element, x, y, width, height, children: childrenNodes, path };
}

function renderNodeToSVG(node: LayoutNode): string {
    let svg = '';
    const { x, y, width, height, element, path } = node;

    // Add data-path attribute to the main group/element of this node for identification
    const commonAttrs = `data-path="${path}" class="interactive-element" draggable="true"`;

    if (element.type === 'Scaffold') {
        const scaffoldEl = element as any;

        // Wrap everything in a group
        svg += `<g ${commonAttrs}>`;

        if (scaffoldEl.appBar) {
            const bgColor = scaffoldEl.appBar.backgroundColor || MD_COLORS.appBar;

            svg += `<g filter="url(#shadow-4)" data-path="${path}.appBar" class="interactive-element">
         <rect x="${x}" y="${y}" width="${width}" height="56" fill="${bgColor}"/>`;

            // Back Button
            if (scaffoldEl.appBar.backButton) {
                const iconPath = getIconPath('arrow_back');
                svg += `<path transform="translate(${x + 16}, ${y + 16})" d="${iconPath}" fill="#FFFFFF"/>`;
            }

            // Title
            const titleX = scaffoldEl.appBar.backButton ? x + 72 : x + 16;
            const titleAlign = scaffoldEl.appBar.centerTitle ? 'middle' : 'start';
            const finalTitleX = scaffoldEl.appBar.centerTitle ? x + width / 2 : titleX;

            svg += `<text x="${finalTitleX}" y="${y + 35}" fill="#FFFFFF" font-family="'Roboto', sans-serif" font-size="20" font-weight="500" text-anchor="${titleAlign}">${scaffoldEl.appBar.title || ''}</text>
       </g>`;
        }
        if (node.children) {
            const sorted = [...node.children].sort((a, b) => {
                const score = (type: string) => {
                    if (type === 'BottomNavigation') return 10;
                    if (type === 'FloatingActionButton') return 20;
                    return 0;
                };
                return score(a.element.type) - score(b.element.type);
            });
            svg += sorted.map(renderNodeToSVG).join('\n');
        }
        svg += `</g>`;
    }
    else if (element.type === 'Container' || element.type === 'VBox' || element.type === 'Column' || element.type === 'Row') {
        const containerEl = element as any;
        svg += `<g ${commonAttrs}>`;
        if (containerEl.color) {
            svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${containerEl.color}"/>`;
        }
        // Transparent hit area for container if no color, so we can select it
        else {
            svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="transparent"/>`;
        }

        if (node.children) {
            svg += node.children.map(renderNodeToSVG).join('\n');
        }
        svg += `</g>`;
    } else if (element.type === 'BottomNavigation') {
        svg += `<g filter="url(#shadow-8)" ${commonAttrs}>
        <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${MD_COLORS.bottomNav}"/>`;
        if (node.children) {
            svg += node.children.map(renderNodeToSVG).join('\n');
        }
        svg += `</g>`;

    } else if (element.type === 'BottomNavigationItem') {
        const itemEl = element as any;
        const color = itemEl.active ? MD_COLORS.primary : MD_COLORS.textSecondary;
        const cx = x + width / 2;
        const cy = y + height / 2;

        const iconPath = getIconPath(itemEl.icon);
        let content = '';
        if (iconPath) {
            content += `<g transform="translate(${cx - 12}, ${cy - 12})" fill="${color}"><path d="${iconPath}"/></g>`;
        } else {
            content += `<circle cx="${cx}" cy="${cy - 8}" r="10" fill="${color}" opacity="0.2"/>`;
        }
        content += `<text x="${cx}" y="${cy + 20}" text-anchor="middle" fill="${color}" font-family="'Roboto', sans-serif" font-size="12">${itemEl.label}</text>`;

        svg += `<g ${commonAttrs}>
            <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="transparent"/> 
            ${content}
        </g>`;

    } else if (element.type === 'FloatingActionButton') {
        const fabEl = element as any;
        const iconPath = getIconPath(fabEl.icon);
        svg += `<g transform="translate(${x}, ${y})" filter="url(#shadow-8)" ${commonAttrs}>
         <circle cx="${width / 2}" cy="${height / 2}" r="${width / 2}" fill="${MD_COLORS.secondary}"/>`;
        if (iconPath) {
            svg += `<path transform="translate(${width / 2 - 12}, ${height / 2 - 12})" d="${iconPath}" fill="#000"/>`;
        }
        svg += `</g>`;

    } else if (element.type === 'Icon') {
        const iconEl = element as any;
        const color = iconEl.color || MD_COLORS.textPrimary;
        const pathStr = getIconPath(iconEl.name);
        svg += `<g ${commonAttrs} transform="translate(${x}, ${y})">`;
        // Hit rect
        svg += `<rect width="${width}" height="${height}" fill="transparent"/>`;
        if (pathStr) {
            svg += `<path transform="scale(${width / 24})" d="${pathStr}" fill="${color}"/>`;
        }
        svg += `</g>`;

    } else if (element.type === 'Text') {
        const textEl = element as any;
        const fontSize = textEl.size || DEFAULT_FONT_SIZE;
        const fill = textEl.color || MD_COLORS.textPrimary;
        const weight = textEl.weight || 'normal';
        // Render lines
        if (node.textLines && node.textLines.length > 0) {
            svg += `<text x="${x}" y="${y}" font-family="'Roboto', sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${fill}" ${commonAttrs}>`;
            node.textLines.forEach((line, i) => {
                svg += `<tspan x="${x}" dy="${i === 0 ? fontSize : fontSize * LINE_HEIGHT}">${line}</tspan>`;
            });
            svg += `</text>`;
        } else {
            // Fallback
            svg += `<text x="${x}" y="${y + fontSize}" font-family="'Roboto', sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${fill}" ${commonAttrs}>${textEl.text}</text>`;
        }

    } else if (element.type === 'Link') {
        const linkEl = element as any;
        const fontSize = linkEl.size || DEFAULT_FONT_SIZE;
        const fill = linkEl.color || MD_COLORS.link;
        svg += `<text x="${x}" y="${y + fontSize}" font-family="'Roboto', sans-serif" font-size="${fontSize}" fill="${fill}" text-decoration="underline" cursor="pointer" ${commonAttrs}>${linkEl.text}</text>`;

    } else if (element.type === 'Button') {
        const btnEl = element as any;
        const variant = btnEl.variant || 'primary';

        let bgColor = MD_COLORS.primary;
        let textColor = MD_COLORS.onPrimary;
        let stroke = 'none';

        if (btnEl.backgroundColor) bgColor = btnEl.backgroundColor;

        if (variant === 'secondary') {
            bgColor = MD_COLORS.secondary;
            textColor = '#000';
        } else if (variant === 'outline') {
            bgColor = 'transparent';
            textColor = btnEl.textColor || MD_COLORS.primary;
            stroke = btnEl.borderColor || MD_COLORS.border;
            if (!btnEl.borderColor) stroke = MD_COLORS.textSecondary;
        } else if (variant === 'ghost') {
            bgColor = 'transparent';
            textColor = btnEl.textColor || MD_COLORS.primary;
        }

        if (btnEl.textColor) textColor = btnEl.textColor;
        if (btnEl.borderColor) stroke = btnEl.borderColor;

        const radius = btnEl.radius !== undefined ? btnEl.radius : 4;

        svg += `<g transform="translate(${x}, ${y})" style="cursor: pointer;" ${commonAttrs}>
      <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}" stroke="${stroke}" stroke-width="${stroke === 'none' ? 0 : 1}"/>
      <text x="${width / 2}" y="${height / 2 + 5}" text-anchor="middle" fill="${textColor}" font-family="'Roboto', sans-serif" font-size="14" font-weight="500" style="text-transform: uppercase; letter-spacing: 1.25px;">${btnEl.text}</text>
    </g>`;

    } else if (element.type === 'EditText' || element.type === 'Input') {
        const inputEl = element as any;
        const borderColor = inputEl.borderColor || MD_COLORS.textSecondary;
        const label = inputEl.label || '';
        const value = inputEl.value || '';
        const placeholder = inputEl.placeholder || inputEl.hint || '';

        svg += `<g transform="translate(${x}, ${y})" ${commonAttrs}>
      <rect width="${width}" height="${height}" rx="4" fill="white" stroke="${borderColor}" stroke-width="1"/>`;

        if (label) {
            svg += `<text x="12" y="12" fill="${MD_COLORS.textSecondary}" font-family="'Roboto', sans-serif" font-size="12" style="background: white"> ${label} </text>`;
        }

        if (value) {
            svg += `<text x="16" y="${height / 2 + 5}" fill="${MD_COLORS.textPrimary}" font-family="'Roboto', sans-serif" font-size="16">${value}</text>`;
        } else if (placeholder) {
            svg += `<text x="16" y="${height / 2 + 5}" fill="${MD_COLORS.textHint}" font-family="'Roboto', sans-serif" font-size="16">${placeholder}</text>`;
        }
        svg += `</g>`;

    } else if (element.type === 'Image') {
        const imgEl = element as any;
        const radius = imgEl.radius || 0;
        const clipId = `clip-${Math.floor(Math.random() * 100000)}`;

        let imgTag = `<image href="${imgEl.src}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`;
        if (!imgEl.src) {
            imgTag = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#eee" rx="${radius}"/><text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" fill="#aaa">Image</text>`;
        } else {
            // Need defs for clipPath
            // Since we are inside the body, adding defs here works in SVG
            svg += `<defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" /></clipPath></defs>`;
        }
        svg += `<g ${commonAttrs}>${imgTag}</g>`;
    }

    return svg;
}

export function render(config: ScreenConfig & { title?: string }, root: ViewBoxRoot['root']): string {
    const width = config.width || 800;
    const height = config.height || 600;

    let safeAreaTop = 0;
    let safeAreaBottom = 0;

    if (config.size === 'Mobile') {
        safeAreaTop = 24;
        safeAreaBottom = 34;
    }

    const availableHeight = height - safeAreaTop;
    const rootLayout = calculateLayout(root, 0, 0, width, availableHeight, safeAreaBottom, 'root');

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
      <style>
        .interactive-element:hover { opacity: 0.8; cursor: pointer; outline: 2px solid #03DAC6; }
      </style>
    </defs>
  `;

    let overlays = '';
    let homeIndicator = '';

    if (config.size === 'Mobile') {
        overlays += `<rect width="${width}" height="${safeAreaTop}" fill="#E0E0E0"/>
                   <text x="14" y="16" font-family="'Roboto', sans-serif" font-size="12" fill="#000">9:41</text>`;

        const homeIndicatorY = height - safeAreaBottom;
        homeIndicator = `<rect x="${(width - 134) / 2}" y="${homeIndicatorY + 21}" width="134" height="5" rx="2.5" fill="#000000"/>`;
    }

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${defs}
  <rect width="${width}" height="${height}" fill="${MD_COLORS.background}"/>
  ${overlays}
  <g transform="translate(0, ${safeAreaTop})">
    ${renderNodeToSVG(rootLayout)}
  </g>
  ${homeIndicator}
</svg>
`;
}
