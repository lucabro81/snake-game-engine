#! /usr/bin/env node

const fs = require('fs-extra');

// copy typings.d.ts to package

try {
	fs.copySync('./src/typings.d.ts', './package/typings.d.ts');
	console.log('"typings.d.ts" successfully copied');
} catch (e) {
	console.error(e.message);
}
