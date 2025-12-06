import fs from 'fs';
import path from 'path';
import { parse } from './parser';
import { render } from './renderer';

const inputFile = process.argv[2];

if (!inputFile) {
    console.error('Usage: ts-node src/index.ts <input-file>');
    process.exit(1);
}

const inputPath = path.resolve(inputFile);
const content = fs.readFileSync(inputPath, 'utf8');

try {
    const { config, root } = parse(content);
    const svg = render(config, root);

    const outputPath = inputPath.replace(/\.(yaml|yml|box)$/, '.svg');
    fs.writeFileSync(outputPath, svg);

    console.log(`Generated: ${outputPath}`);
} catch (e) {
    console.error('Error:', e);
}
