#!/usr/bin/env node
// npm run gen:component Card
const fs = require('fs');
const path = require('path');

const [rawName] = process.argv.slice(2);

if (!rawName || ['-h', '--help', 'help'].includes(rawName)) {
  console.log('Usage: npm run gen:component <Name>');
  console.log('Example: npm run gen:component Card');
  process.exit(1);
}

const name = rawName;

const toPascal = (value) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+(.)(\w*)/g, (_, c, r) => c.toUpperCase() + r)
    .replace(/^\w/, (c) => c.toUpperCase());

const componentName = toPascal(name);
const baseDir = path.join(process.cwd(), 'src', 'components', componentName);

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

const componentPath = path.join(baseDir, 'component.tsx');
const indexPath = path.join(baseDir, 'index.ts');
const stylePath = path.join(baseDir, `${componentName}.module.css`);

const componentTemplate = `import type { FC, HTMLAttributes } from 'react';
import styles from './${componentName}.module.css';

type ${componentName}Props = HTMLAttributes<HTMLDivElement>;

const ${componentName}: FC<${componentName}Props> = ({ className = '', children, ...rest }) => {
  return (
    <div className={\`\${styles.root} \${className}\`} {...rest}>
      {children ?? '${componentName} is a awesome component'}
    </div>
  );
};

export default ${componentName};
export { ${componentName} };
`;

const indexTemplate = `import ${componentName} from './component';

export default ${componentName};
export * from './component';
`;

const styleTemplate = `.root {
  display: flex;
}
`;

const writeIfMissing = (file, content) => {
  if (fs.existsSync(file)) {
    console.warn(`Skip existing file: ${path.relative(process.cwd(), file)}`);
    return;
  }
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Created ${path.relative(process.cwd(), file)}`);
};

writeIfMissing(componentPath, componentTemplate);
writeIfMissing(indexPath, indexTemplate);
writeIfMissing(stylePath, styleTemplate);
