import path from 'node:path';
import fs from 'node:fs/promises';

const pkgName = process.argv[2];

await fs.mkdir(
	path.resolve(import.meta.dirname, '../packages', pkgName, 'src'),
	{
		recursive: true
	}
);

const baseTsc = path.resolve(import.meta.dirname, '../tsconfig.json');

const pkgJson = {
	name: pkgName,
	version: '1.0.0',
	private: true,
	type: 'module',
	author: {
		name: 'NaviTheCoderboi',
		url: 'https://github.com/NaviTheCoderboi'
	},
	license: 'MIT',
	exports: {
		'.': {
			import: './dist/index.js',
			types: './dist/index.d.ts',
			default: './dist/index.js'
		}
	},
	scripts: {
		typecheck: 'tsc --noEmit',
		build: 'libx build'
	},
	dependencies: {}
};

const tsConfig = {
	extends: path
		.relative(
			path.resolve(import.meta.dirname, '../packages', pkgName),
			baseTsc
		)
		.replace(/\\/g, '/'),
	include: ['src/**/*'],
	exclude: ['node_modules', 'dist']
};

const libxConfig = `import { defineConfig } from '@navithecoderboi/libx';

export default defineConfig((opts) => {
	const dev = opts.watch === undefined ? false : opts.watch;

	return {
		entry: ['./src'],
		clean: true,
		dts: !dev,
		sourcemap: dev,
		platform: 'browser',
		tsconfig: './tsconfig.json'
	};
});`;

await fs.writeFile(
	path.resolve(import.meta.dirname, `../packages/${pkgName}/package.json`),
	JSON.stringify(pkgJson, null, 4)
);

await fs.writeFile(
	path.resolve(import.meta.dirname, `../packages/${pkgName}/tsconfig.json`),
	JSON.stringify(tsConfig, null, 4)
);

await fs.writeFile(
	path.resolve(import.meta.dirname, `../packages/${pkgName}/libx.config.js`),
	libxConfig
);

await fs.writeFile(
	path.resolve(import.meta.dirname, `../packages/${pkgName}/src/index.ts`),
	''
);

console.log('\x1b[32m', `Package ${pkgName} created successfully!`);
