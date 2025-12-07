export type ScreenSize = 'Web' | 'Mobile' | 'Custom';

export interface ScreenConfig {
    size: ScreenSize;
    width?: number;
    height?: number;
}

export type ElementType =
    | 'Scaffold'
    | 'Container' | 'VBox' | 'Column'
    | 'Text'
    | 'Button'
    | 'EditText' | 'Input'
    | 'BottomNavigation'
    | 'BottomNavigationItem'
    | 'FloatingActionButton'
    | 'Icon'
    | 'Image'
    | 'Link';

export interface BaseElement {
    type: ElementType;
    width?: number | string;
    height?: number | string;
    padding?: number;
    margin?: number; // Not heavily used yet but good to have
    gap?: number;
    children?: ViewElement[];
}

export interface TextElement extends BaseElement {
    text: string;
    size?: number;
    color?: string;
    weight?: string; // 'bold', 'normal', '500', etc.
}

export interface ButtonElement extends BaseElement {
    text: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; // Existing
    // New props
    borderColor?: string;
    backgroundColor?: string;
    radius?: number;
    textColor?: string;
}

export interface InputElement extends BaseElement {
    label?: string; // Floating label / Field name
    value?: string; // Current input value
    placeholder?: string; // Hint text when empty
    hint?: string; // Deprecated alias for placeholder or helper text
    borderColor?: string;
}

export interface ImageElement extends BaseElement {
    src: string;
    alt?: string;
    radius?: number;
    fit?: 'cover' | 'contain' | 'fill'; // For future use if we do complex image logic
}

export interface LinkElement extends BaseElement {
    text: string;
    url?: string; // Visual only for now
    size?: number;
    color?: string;
}

export interface ScaffoldElement extends BaseElement {
    appBar?: {
        title: string;
        backButton?: boolean; // New
        centerTitle?: boolean; // New
        backgroundColor?: string;
        actions?: ViewElement[]; // Future proofing
    };
    body?: ViewElement;
    bottomNavigation?: BaseElement & {
        items?: { label: string; icon?: string; active?: boolean }[]; // Legacy
        children?: ViewElement[]; // New standard
    };
    floatingActionButton?: BaseElement & {
        icon?: string;
    };
}

export interface BottomNavigationItemElement extends BaseElement {
    label: string;
    icon: string;
    active?: boolean;
}

export interface IconElement extends BaseElement {
    name: string;
    size?: number;
    color?: string;
}

export type ViewElement =
    | BaseElement
    | TextElement
    | ButtonElement
    | InputElement
    | ScaffoldElement
    | BottomNavigationItemElement
    | IconElement
    | ImageElement
    | LinkElement;

export interface ViewBoxRoot {
    config: ScreenConfig & { title?: string };
    root: ViewElement;
}
