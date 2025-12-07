import { useState, useEffect, useRef, useMemo } from 'react'
import { parse } from './lib/viewbox/parser'
import { render } from './lib/viewbox/renderer'
import { Image as ImageIcon, FileCode, X } from 'lucide-react'
import { load, dump } from 'js-yaml'
import './index.css'

const DEFAULT_YAML = `size: Mobile
Scaffold:
  appBar:
    title: "My Profile"
    centerTitle: true
    backgroundColor: "#6200EE"
    backButton: true
  body:
    Column:
      padding: 20
      gap: 16
      children:
        - Container:
            child:
              Row:
                gap: 16
                children:
                  - Image:
                      width: 80
                      height: 80
                      radius: 40
                      src: "https://i.pravatar.cc/150?img=68"
                  - Column:
                      children:
                        - Text:
                            text: "John Doe"
                            size: 24
                            weight: "bold"
                        - Text:
                            text: "Software Engineer"
                            size: 14
                            color: "#666"
        - Container:
            height: 1
            color: "#eee"
        - Text:
            text: "Biography"
            size: 18
            weight: "bold"
        - Text:
            text: "Passionate developer building amazing experiences with ViewBox."
            color: "#444"
        - Row:
            gap: 10
            children:
              - Button:
                  text: "Contact"
                  variant: "primary"
                  width: 120
              - Button:
                  text: "More"
                  variant: "outline"
  bottomNavigation:
    children:
      - BottomNavigationItem:
          label: "Home"
          icon: "home"
          active: true
      - BottomNavigationItem:
          label: "Search"
          icon: "search"
      - BottomNavigationItem:
          label: "Profile"
          icon: "person"
`;

// Property Schemas
const COMMON_PROPS = ['width', 'height', 'padding', 'margin', 'gap'];

const COMPONENT_SCHEMAS: Record<string, string[]> = {
    Text: [...COMMON_PROPS, 'text', 'size', 'color', 'weight'],
    Button: [...COMMON_PROPS, 'text', 'variant', 'backgroundColor', 'borderColor', 'textColor', 'radius'],
    EditText: [...COMMON_PROPS, 'label', 'value', 'placeholder', 'borderColor'],
    Input: [...COMMON_PROPS, 'label', 'value', 'placeholder', 'borderColor'],
    Image: [...COMMON_PROPS, 'src', 'alt', 'radius', 'fit'],
    Link: [...COMMON_PROPS, 'text', 'url', 'size', 'color'],
    Icon: [...COMMON_PROPS, 'name', 'size', 'color'],
    BottomNavigationItem: [...COMMON_PROPS, 'label', 'icon', 'active'],
    Container: [...COMMON_PROPS, 'color'],
    VBox: [...COMMON_PROPS, 'color'],
    Column: [...COMMON_PROPS, 'color'],
    Scaffold: [...COMMON_PROPS], // Scaffold props are nested often (appBar, etc), treated specially or as basic
    appBar: ['title', 'centerTitle', 'backgroundColor', 'backButton'],
    BottomNavigation: [...COMMON_PROPS],
    FloatingActionButton: [...COMMON_PROPS, 'icon'],
};

const DRAGGABLE_COMPONENTS = {
    Container: { Container: { width: 100, height: 100, color: '#eee' } },
    Row: { Row: { gap: 10, children: [] } },
    Column: { Column: { gap: 10, children: [] } },
    Text: { Text: { text: 'New Text', size: 16 } },
    Button: { Button: { text: 'Button', variant: 'primary' } },
    Image: { Image: { width: 100, height: 100, src: 'https://via.placeholder.com/150' } },
    Icon: { Icon: { name: 'home', size: 24 } }
};

function App() {
    const [yaml, setYaml] = useState(DEFAULT_YAML);
    const [svgContent, setSvgContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [selectedProps, setSelectedProps] = useState<Record<string, any> | null>(null);

    const previewRef = useRef<HTMLDivElement>(null);

    // Parse YAML to object for internal logic
    const yamlObj = useMemo(() => {
        try {
            return load(yaml) as any;
        } catch {
            return null;
        }
    }, [yaml]);

    useEffect(() => {
        try {
            const { config, root } = parse(yaml);
            const svg = render(config, root);
            setSvgContent(svg);
            setError(null);
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Error parsing YAML');
        }
    }, [yaml]);

    // Helper to traverse YAML object using the AST path, compensating for the Component Key wrapper
    const resolveYamlPath = (doc: any, path: string) => {
        const parts = path.split('.');
        const pathStack: (string | number)[] = [];
        let current = doc;

        // Handle Root
        if (parts[0] === 'root') {
            const rootKey = Object.keys(current).find(k => !['size', 'screen', 'title', 'width', 'height', 'config'].includes(k));
            if (!rootKey) return { target: null, parent: null, lastKey: null, fullPath: [] };

            current = current[rootKey];
            pathStack.push(rootKey);
            parts.shift();
        }

        for (const part of parts) {
            if (!current) break;

            if (Array.isArray(current)) {
                // Ensure part is treated as index if possible
                const index = parseInt(part);
                if (!isNaN(index)) {
                    // Cast to any to avoid implicit any if type isn't known
                    current = (current as any)[index];
                    pathStack.push(index);
                } else {
                    current = (current as any)[part];
                    pathStack.push(part);
                }
            } else if (typeof current === 'object') {
                const keys = Object.keys(current);
                // Heuristic: Auto-enter component wrapper if encountered
                if (keys.length === 1 && /^[A-Z]/.test(keys[0]) && COMPONENT_SCHEMAS[keys[0]]) {
                    current = (current as any)[keys[0]];
                    pathStack.push(keys[0]);
                }

                current = (current as any)[part];
                pathStack.push(part);
            }
        }

        // Final check: unwrap if we landed on a component wrapper
        if (current && typeof current === 'object') {
            const keys = Object.keys(current);
            if (keys.length === 1 && /^[A-Z]/.test(keys[0]) && COMPONENT_SCHEMAS[keys[0]]) {
                current = current[keys[0]];
                pathStack.push(keys[0]);
            }
        }

        return { target: current, fullPath: pathStack };
    };

    // Sync selected props when selection or yaml changes
    useEffect(() => {
        if (selectedPath && yamlObj) {
            const { target } = resolveYamlPath(yamlObj, selectedPath);
            if (target && typeof target === 'object') {
                // We likely found the props object.
                // We also need to know the 'type' to show correct schema.
                // In the new syntax, 'type' is implicit from the key valid in resolveYamlPath.
                // But `target` is just the properties object (e.g. { text: "...", size: 24 }).
                // It doesn't have `type`.
                // We need to infer type from the LAST key we entered that was a Component Name.

                // Let's modify resolveYamlPath to also return the inferred type?
                // Or just look at the fullPath.

                // Quick hack: Re-run traverse to find type
                const { fullPath } = resolveYamlPath(yamlObj, selectedPath);
                // Find last key that is a Component Name
                const componentType = fullPath.reverse().find(k => typeof k === 'string' && COMPONENT_SCHEMAS[k]) as string;

                setSelectedProps({ ...target, type: componentType || 'Unknown' });
            } else {
                setSelectedProps(null);
            }
        } else {
            setSelectedProps(null);
        }
    }, [selectedPath, yamlObj]);

    // ... updateYamlProperty implementation needs to use resolveYamlPath too ...



    const updateYamlProperty = (key: string, value: any) => {
        console.log('updateYamlProperty', key, value, selectedPath);
        if (!selectedPath || !yamlObj) return;

        let doc: any;
        try {
            doc = load(yaml);
        } catch (e) { return; }

        const { target } = resolveYamlPath(doc, selectedPath);
        console.log('Update target:', target);

        if (!target || typeof target !== 'object') {
            console.log('Target not an object or not found');
            return;
        }

        // target is the object to modify (the props object)
        const current = target;

        // Update value
        if (value === '' && typeof current[key] === 'number') {
            delete current[key];
        } else if (value === '' && typeof current[key] === 'boolean') {
            // If boolean property is cleared, remove it
            delete current[key];
        }
        else if (value === '') {
            current[key] = value;
        } else if (!isNaN(Number(value)) && key !== 'text' && key !== 'color' && key !== 'backgroundColor' && key !== 'src' && key !== 'label' && key !== 'title' && typeof value === 'string' && value.trim() !== '') {
            current[key] = Number(value);
        } else if (value === 'true') {
            current[key] = true;
        } else if (value === 'false') {
            current[key] = false;
        } else {
            current[key] = value;
        }

        try {
            const newYaml = dump(doc, { indent: 2 });
            setYaml(newYaml);
        } catch (e) {
            console.error('Failed to dump yaml', e);
        }
    };

    const handlePreviewClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const pathElement = target.closest('[data-path]');
        if (pathElement) {
            const path = pathElement.getAttribute('data-path');
            console.log('Clicked path:', path);
            if (path) {
                const { target: resolved } = resolveYamlPath(yamlObj, path);
                console.log('Resolved target:', resolved);
                setSelectedPath(path);
                e.stopPropagation();
                return;
            }
        }
        console.log('Clicked outside or no path');
        setSelectedPath(null);
    };

    const downloadSVG = () => {
        if (!svgContent) return;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'design.svg';
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadPNG = () => {
        if (!svgContent || !previewRef.current) return;
        const img = new Image();
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const widthMatch = svgContent.match(/width="(\d+)"/);
            const heightMatch = svgContent.match(/height="(\d+)"/);
            // Fallback if regex fails (though renderer adds them)
            const w = widthMatch ? parseInt(widthMatch[1]) : img.width || 800;
            const h = heightMatch ? parseInt(heightMatch[1]) : img.height || 600;

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const pngUrl = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = 'design.png';
                a.click();
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const handleDragStart = (e: React.DragEvent, type: string) => {
        e.dataTransfer.setData('componentType', type);
        e.dataTransfer.effectAllowed = 'copy';

        // Check if we are dragging an existing component from the preview
        const target = e.target as HTMLElement;
        const pathElement = target.closest('[data-path]');
        if (pathElement) {
            const path = pathElement.getAttribute('data-path');
            if (path) {
                e.dataTransfer.setData('sourcePath', path);
                e.dataTransfer.setData('dragType', 'move');
                e.dataTransfer.effectAllowed = 'move';
            }
        } else {
            e.dataTransfer.setData('dragType', 'add');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        // If moving, we might want 'move' effect
        // but copy usually works for generic DnD feedback
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dragType = e.dataTransfer.getData('dragType');

        const target = e.target as HTMLElement;
        const pathElement = target.closest('[data-path]');
        const targetPath = pathElement?.getAttribute('data-path');

        if (dragType === 'move') {
            const sourcePath = e.dataTransfer.getData('sourcePath');
            if (sourcePath && targetPath) {
                console.log('Move from', sourcePath, 'to', targetPath);
                moveComponent(sourcePath, targetPath);
            }
            return;
        }

        // Add new component
        const type = e.dataTransfer.getData('componentType');
        if (!type || !DRAGGABLE_COMPONENTS[type as keyof typeof DRAGGABLE_COMPONENTS]) return;

        if (targetPath) {
            console.log('Drop on path:', targetPath);
            addComponentToPath(targetPath, type);
        }
    };

    const moveComponent = (sourcePath: string, targetPath: string) => {
        if (sourcePath === targetPath || targetPath.startsWith(sourcePath)) return;

        let doc: any;
        try {
            doc = load(yaml);
        } catch (e) { return; }

        // 1. Resolve Source Parent and Key
        // This logic is tricky with `resolveYamlPath` because we need the PARENT object to delete/splice.
        // `resolveYamlPath` gives us the object itself.
        // We can get the parent by resolving `sourceParentPath` or using `fullPath` stack.

        // Let's implement a simpler "getParent" logic or just rely on manual traversal for source removal.

        const { target: sourceObj } = resolveYamlPath(doc, sourcePath);
        if (!sourceObj) return;

        // Clone source object data
        const componentData = JSON.parse(JSON.stringify(sourceObj));

        // Remove from Source
        // We need to find the parent container in the YAML structure.
        // If we use our simple `getParentAndKey` relative to string path, it might work if path corresponds to YAML structure.
        // Our `path` in `renderer` includes `children.0`, etc.
        // So `split('.')` works fairly well.

        // Remove logic
        // We need to re-find parent because we need reference to modify it.
        // Re-parsing doc is already done.

        const removeSource = () => {
            const parts = sourcePath.split('.');
            const key = parts.pop(); // e.g. "0" or "floatingActionButton"
            const parentP = parts.join('.');
            const { target: parent } = resolveYamlPath(doc, parentP);

            if (Array.isArray(parent)) {
                const idx = Number(key);
                if (!isNaN(idx)) {
                    parent.splice(idx, 1);
                    return true;
                }
            } else if (parent && typeof parent === 'object') {
                // Object property
                // If it's a component wrapper like `{ Text: ... }` inside a child prop?
                // No, our resolve logic digs into components.
                // If sourcePath is `...children.0`, parent is the array.
                // If sourcePath is `...child`, parent is the Container object (hopefully).
                delete parent[key as string];
                return true;
            }
            return false;
        };

        if (!removeSource()) {
            console.error('Failed to remove source');
            return;
        }

        // Add to Target
        // We need to insert `componentData` into `targetPath`.
        // Similar logic to `addComponentToPath`.

        const { target: dropTarget } = resolveYamlPath(doc, targetPath);

        if (Array.isArray(dropTarget)) {
            dropTarget.push(componentData);
        }
        else if (dropTarget && dropTarget.children && Array.isArray(dropTarget.children)) {
            dropTarget.children.push(componentData);
        }
        else if (dropTarget && dropTarget.child === undefined && (targetPath.endsWith('Container') || targetPath.includes('Container'))) {
            dropTarget.child = componentData;
        } else {
            // Fallback: If dropped on a Text node in a Column, append to Column? 
            // We might have removed it already.
            // Let's try to find parent of target if strict drop failed.
            const parts = targetPath.split('.');
            parts.pop(); // pop "0" or "child" or whatever
            // Actually if we drop on "children.1", we want to insert at 2?
            // Or if we drop on "Text", we want to add to "children" of parent.

            // For now, only support explicit container drop.
        }

        try {
            const newYaml = dump(doc, { indent: 2 });
            setYaml(newYaml);
        } catch (e) {
            console.error('Failed to dump yaml', e);
        }
    };

    const addComponentToPath = (path: string, type: string) => {
        if (!yamlObj) return;
        let doc: any;
        try {
            doc = load(yaml);
        } catch (e) { return; }

        const { target: dropTarget } = resolveYamlPath(doc, path);
        if (!dropTarget || typeof dropTarget !== 'object') return;

        const template = DRAGGABLE_COMPONENTS[type as keyof typeof DRAGGABLE_COMPONENTS];

        // Determine where to add:
        // If target is array (children), push.
        // If target is Container (has child prop), set child.
        // If target is Scaffold (body), set body?

        // Note: resolveYamlPath returns the object at path.
        // If path points to `Column`, target is the Column object `{diff props }`.

        // We need to check if target has `children` array or can have `child`.

        // Case 1: Target has connection to `children`
        if (Array.isArray(dropTarget)) {
            dropTarget.push(template);
        }
        else if (dropTarget.children && Array.isArray(dropTarget.children)) {
            dropTarget.children.push(template);
        }
        else if (dropTarget.child === undefined && (path.endsWith('Container') || path.includes('Container'))) {
            // Container layout logic usually
            dropTarget.child = template;
        }
        // Heuristic: If we dropped ON a component (like Text), we might want to append to its parent?
        // But `path` points to the Text.
        // Let's implement dropping INTO containers first.

        try {
            const newYaml = dump(doc, { indent: 2 });
            setYaml(newYaml);
        } catch (e) {
            console.error('Failed to dump yaml', e);
        }
    };

    // Compute all properties to show
    const allProps = useMemo(() => {
        if (!selectedProps) return [];
        const type = selectedProps.type;
        if (type && COMPONENT_SCHEMAS[type]) {
            return COMPONENT_SCHEMAS[type];
        }
        // Fallback: show distinct keys from the object itself if no schema
        return Object.keys(selectedProps).filter(k => k !== 'type');
    }, [selectedProps]);

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh', flexDirection: 'column' }}>
            <header style={{ padding: '10px 20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '1.2rem' }}>Markdown ViewBox</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={downloadSVG} title="Download SVG" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', cursor: 'pointer' }}>
                        <FileCode size={16} /> SVG
                    </button>
                    <button onClick={downloadPNG} title="Download PNG" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', cursor: 'pointer' }}>
                        <ImageIcon size={16} /> PNG
                    </button>
                </div>
            </header>

            <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Palette */}
                <div style={{ width: '60px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', background: '#252526' }}>
                    {Object.keys(DRAGGABLE_COMPONENTS).map(type => (
                        <div
                            key={type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, type)}
                            style={{
                                width: '40px',
                                height: '40px',
                                marginBottom: '10px',
                                background: '#333',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'grab',
                                color: '#eee',
                                fontSize: '10px',
                                flexDirection: 'column',
                                textAlign: 'center'
                            }}
                            title={type}
                        >
                            {type.substring(0, 2)}
                        </div>
                    ))}
                </div>

                {/* Editor */}
                <div style={{ flex: 1, borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', minWidth: '300px', maxWidth: '400px' }}>
                    <div style={{ background: '#252526', padding: '8px', borderBottom: '1px solid #333', fontSize: '0.9rem', color: '#aaa' }}>
                        YAML definition
                    </div>
                    <textarea
                        value={yaml}
                        onChange={(e) => setYaml(e.target.value)}
                        style={{
                            flex: 1,
                            width: '100%',
                            background: '#1e1e1e',
                            color: '#d4d4d4',
                            outline: 'none',
                            border: 'none',
                            padding: '16px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            resize: 'none',
                            whiteSpace: 'pre',
                            overflow: 'auto'
                        }}
                        spellCheck={false}
                    />
                    {error && (
                        <div style={{ padding: '10px', background: '#692020', color: '#ffbaba', fontSize: '0.8rem' }}>
                            Error: {error}
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#333333', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ background: '#252526', padding: '8px', borderBottom: '1px solid #333', fontSize: '0.9rem', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Preview {selectedPath ? `(Selected: ${selectedPath})` : ''}</span>
                    </div>
                    <div
                        ref={previewRef}
                        onClick={handlePreviewClick}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                            overflow: 'auto',
                            backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    >
                        <div
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                            style={{
                                background: 'transparent',
                                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                                display: 'flex'
                            }}
                        />
                    </div>

                    {/* Property Inspector Overlay */}
                    {selectedProps && (
                        <div style={{
                            position: 'absolute',
                            right: 20,
                            top: 60,
                            width: '280px',
                            background: '#252526',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '80vh'
                        }}>
                            <div style={{ padding: '10px', borderBottom: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                                <span>Properties</span>
                                <button onClick={() => setSelectedPath(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                            <div style={{ padding: '10px', overflowY: 'auto' }}>
                                <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: '#888' }}>
                                    Type: {selectedProps.type}
                                </div>

                                {allProps.map(key => {
                                    const val = selectedProps[key];
                                    return (
                                        <div key={`${key}-${val}`} style={{ marginBottom: '12px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>{key}</label>
                                            <input
                                                type="text"
                                                defaultValue={val !== undefined ? String(val) : ''}
                                                placeholder="unset"
                                                onBlur={(e) => updateYamlProperty(key, e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                                style={{
                                                    width: '100%',
                                                    background: '#1e1e1e',
                                                    border: '1px solid #444',
                                                    color: val !== undefined ? '#ddd' : '#777',
                                                    padding: '4px 8px',
                                                    borderRadius: '2px'
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default App;
