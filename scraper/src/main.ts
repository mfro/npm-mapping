import * as path from 'path';

import fs from 'fs-extra';
import * as semver from 'semver';
import request from 'request-promise-native';

interface Version {
    name: string,
    version: string,
    dependencies: { [name: string]: string },
}

interface Package {
    versions: { [version: string]: Version },
}

const known = new Map<string, Package>();

function error(msg: string) {
    debugger;
    throw new Error(msg);
}

async function get_package(name: string) {
    if (known.has(name)) {
        let x = known.get(name)!;
        return x;
    }

    let cache = `cache/${name}`;
    fs.mkdirpSync(path.dirname(cache));

    let data: Package;
    try {
        data = fs.readJsonSync(cache);
    } catch {
        let url = `https://registry.npmjs.org/${name}`;
        data = await request.get(url, {
            headers: { 'accept': 'application/vnd.npm.install-v1+json' },
        });
        if (typeof data == 'string') data = JSON.parse(data);
        fs.writeJsonSync(cache, data);
    }

    known.set(name, data);
    return data;
}

interface Dep {
    key: string,
    name: string,
    version: string,
    deps: string[],
}

const allNodes = new Map<string, Dep>();

async function explore(name: string, range: string): Promise<Dep> {
    let pack = await get_package(name);

    let versions = Object.keys(pack.versions)

    let match = semver.maxSatisfying(versions, range);
    if (match == null) throw error('no matching version');

    let target = pack.versions[match];

    let info = allNodes.get(name + ' ' + match);
    if (info) return info;

    allNodes.set(name + ' ' + match, info = {
        key: name + ' ' + match,
        name: name,
        version: match,
        deps: [],
    });

    for (let dep in target.dependencies) {
        let found = await explore(dep, target.dependencies[dep]);
        info.deps.push(found.key);
    }

    return info;
}

async function run(name: string) {
    fs.mkdirpSync(`cache`);

    let npm = await explore(name, '*');

    fs.writeJsonSync('../output.json', [...allNodes.values()]);
}

let start = process.argv[2] || 'npm';

run(start);
