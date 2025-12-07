import yaml from 'js-yaml';
import { ViewBoxRoot, ElementType } from './types';

export const SCREEN_PRESETS: Record<string, { width: number; height: number }> = {
    Web: { width: 1280, height: 800 },
    Mobile: { width: 375, height: 812 },
    // Custom defaults
    Custom: { width: 800, height: 600 },
};

const COMPONENT_NAMES = new Set<string>([
    'Scaffold',
    'Container', 'VBox', 'Column',
    'Text',
    'Button',
    'EditText', 'Input',
    'BottomNavigation',
    'BottomNavigationItem',
    'FloatingActionButton',
    'Row',
    'Icon',
    'Image',
    'Link'
]);

function transformNode(node: any): any {
    if (Array.isArray(node)) {
        return node.map(transformNode);
    }
    if (node && typeof node === 'object') {
        const keys = Object.keys(node);

        // Check if explicit type exists, if so, just process children properties recursively
        if (node.type) {
            const newNode: any = { ...node };
            for (const key of keys) {
                if (key === 'children' || key === 'child' || key === 'body') {
                    newNode[key] = transformNode(node[key]);
                } else if (key === 'bottomNavigation') {
                    const nav = transformNode(node[key]);
                    if (!nav.type) nav.type = 'BottomNavigation';
                    newNode[key] = nav;
                } else if (key === 'floatingActionButton') {
                    const fab = transformNode(node[key]);
                    if (!fab.type) fab.type = 'FloatingActionButton';
                    newNode[key] = fab;
                } else if (key === 'appBar') {
                    // AppBar is a special prop object, but if it has actions/children it might need parsing
                    // Currently AppBar is a config object, not a full component in our simplified model, 
                    // but let's recurse just in case we expand it.
                    newNode[key] = node[key];
                }
            }
            return newNode;
        }

        // Implicit type check: Look for a key that is a Component Name
        for (const key of keys) {
            if (COMPONENT_NAMES.has(key)) {
                // Found a component key like "Scaffold: ..."
                // The value of this key contains the properties
                const props = node[key] || {};

                // Construct the typed object
                const typedNode = {
                    type: key as ElementType,
                    ...props
                };

                // Recurse on the properties of this typed node
                return transformNode(typedNode);
            }
        }

        // If no component key found, just recurse on values (e.g. might be a wrapper or props object)
        const newNode: any = {};
        for (const key of keys) {
            newNode[key] = transformNode(node[key]);
        }
        return newNode;
    }
    return node;
}


export function parse(source: string): ViewBoxRoot {
    const doc = yaml.load(source) as any;

    if (!doc || typeof doc !== 'object') {
        throw new Error('Invalid YAML: Root must be an object.');
    }

    // Support both 'size' and 'screen' for backward compatibility
    const screenType = doc.size || doc.screen || 'Web';
    let width = doc.width;
    let height = doc.height;

    if (screenType !== 'Custom') {
        const preset = SCREEN_PRESETS[screenType];
        if (preset) {
            width = preset.width;
            height = preset.height;
        }
    }

    if (screenType === 'Custom') {
        width = width || SCREEN_PRESETS.Custom.width;
        height = height || SCREEN_PRESETS.Custom.height;
    }

    // Determine Root:
    // 1. Explicit 'root' property
    // 2. Implicit: The top-level object itself contains a Component Key (e.g. Scaffold: ...)

    let rootNode: any;

    if (doc.root) {
        rootNode = transformNode(doc.root);
    } else {
        // Try to find a component key at the top level
        // Exclude config keys like size, title, width, height

        // If we find exactly one component-like key, treat it as root
        // Or if we find a key that matches a Component Name, transform it.
        // Actually transformNode logic handles finding the component key inside an object.
        // But doc contains config props too. We want to extract the component set.

        // Let's create a "candidate" object excluding config to see if it transforms into a valid component
        const candidate = { ...doc };
        delete candidate.size;
        delete candidate.screen;
        delete candidate.title;
        delete candidate.width;
        delete candidate.height;

        const transformed = transformNode(candidate);

        if (transformed && transformed.type) {
            rootNode = transformed;
        } else {
            // Fallback or Error? 
            // If no root found, maybe the user provided just "Text: ..." structure on top level?
            // transformNode(doc) might have worked if doc had "Scaffold: ..." property.
            // But doc has "size: Mobile", "Scaffold: ...".
            // transformNode iterates keys. If it finds Scaffold, it returns that component.
            // However, transformNode returns the *first* component it finds if it scans keys.
            // This might be risky if order isn't guaranteed, but usually YAML parsers preserve order or we just iterate.

            // Let's try transforming the doc directly, but beware it might pick up "size" if we aren't careful? NO, "size" is not in COMPONENT_NAMES.
            rootNode = transformNode(doc);

            // If transformNode(doc) returns an object with `type`, use it.
            // If it returns an object without `type` (just the dict), then we failed to find a root component.
            if (!rootNode.type) {
                throw new Error('Could not determine root component. Please specify "root" or use a top-level component key like "Scaffold:".');
            }
        }
    }

    return {
        config: {
            size: screenType,
            width: width!,
            height: height!,
            title: doc.title
        },
        root: rootNode
    };
}
