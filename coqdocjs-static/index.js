/*jshint esversion: 6 */
import { preprocess } from "./preprocess.js";
import { JSDOM } from "jsdom";
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import process from 'node:process';

const options = {
    inplace: {
	type: 'boolean' ,
	short: 'i',
	default: false,
    }
};

const {values, positionals} = parseArgs({options, allowPositionals: true});

if (positionals.length != 1) {
    process.stderr.write('Usage: coqdocjs-static [--inplace/-i] FILE\n');
    process.exit(1);
}

const filename = positionals[0];
const data = readFileSync(filename,'utf8');
const dom = new JSDOM(data);
console.log(`processing ${filename}`);
preprocess(dom.window.document, dom.window.Node);
const serialized = dom.serialize();
if (values.inplace) {
    writeFileSync(filename, serialized);
}
else {
    process.stdout.write(serialized);
}
