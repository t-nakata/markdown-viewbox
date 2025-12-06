export type ScreenSize = 'Web' | 'Mobile' | 'Custom';

export interface ScreenConfig {
    size: ScreenSize;
    width?: number; // For Custom
    height?: number; // For Custom
}

// Updated component names
export type ElementType =
    | 'Scaffold'
    | 'Container'
    | 'Column'
    | 'VBox'
    | 'Text'
    | 'Button'
    | 'FloatingActionButton'
    | 'BottomNavigation'
    | 'EditText'
    | 'Input'
    | 'Box';

export interface BaseElement {
    type: ElementType;
    width?: number | string;
    height?: number | string;
    padding?: number;
    gap?: number;
    align?: 'start' | 'center' | 'end';
    justify?: 'start' | 'center' | 'end' | 'space-between';
    children?: BaseElement[];
}

export interface FloatingActionButtonElement extends BaseElement {
    type: 'FloatingActionButton';
    icon?: string; // Text for now, e.g. "+"
}

export interface BottomNavigationElement extends BaseElement {
    type: 'BottomNavigation';
    items: { label: string; icon?: string; active?: boolean }[];
}

export interface ScaffoldElement extends BaseElement {
    type: 'Scaffold';
    appBar?: { title: string; actions?: string[] };
    body?: BaseElement;
    floatingActionButton?: FloatingActionButtonElement;
    bottomNavigation?: BottomNavigationElement;
}

export interface ContainerElement extends BaseElement {
    type: 'Container';
    color?: string;
    // Container can have children in our specific DSL
}

export interface TextElement extends BaseElement {
    type: 'Text';
    text: string;
    size?: number;
    weight?: 'normal' | 'bold';
    color?: string;
}

export interface ButtonElement extends BaseElement {
    type: 'Button';
    text: string;
    variant?: 'primary' | 'secondary';
}

export interface EditTextElement extends BaseElement {
    type: 'EditText';
    hint?: string;
    label?: string;
    value?: string;
}

export type ViewElement = BaseElement | ScaffoldElement | ContainerElement | TextElement | ButtonElement | EditTextElement | FloatingActionButtonElement | BottomNavigationElement;

export interface ViewBoxRoot {
    screen?: ScreenSize;
    width?: number;
    height?: number;
    title?: string;
    root: ViewElement;
}
