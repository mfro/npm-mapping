'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = require('path');
var fs = _interopDefault(require('fs-extra'));
var semver = require('semver');
var request = _interopDefault(require('request-promise-native'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const known = new Map();
function error(msg) {
    debugger;
    throw new Error(msg);
}
function get_package(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (known.has(name)) {
            let x = known.get(name);
            return x;
        }
        let cache = `cache/${name}`;
        fs.mkdirpSync(path.dirname(cache));
        let data;
        try {
            data = fs.readJsonSync(cache);
        }
        catch (_a) {
            let url = `https://registry.npmjs.org/${name}`;
            data = yield request.get(url, {
                headers: { 'accept': 'application/vnd.npm.install-v1+json' },
            });
            if (typeof data == 'string')
                data = JSON.parse(data);
            fs.writeJsonSync(cache, data);
        }
        known.set(name, data);
        return data;
    });
}
const allNodes = new Map();
function explore(name, range) {
    return __awaiter(this, void 0, void 0, function* () {
        let pack = yield get_package(name);
        let versions = Object.keys(pack.versions);
        let match = semver.maxSatisfying(versions, range);
        if (match == null)
            throw error('no matching version');
        let target = pack.versions[match];
        let info = allNodes.get(name + ' ' + match);
        if (info)
            return info;
        allNodes.set(name + ' ' + match, info = {
            key: name + ' ' + match,
            name: name,
            version: match,
            deps: [],
        });
        for (let dep in target.dependencies) {
            let found = yield explore(dep, target.dependencies[dep]);
            info.deps.push(found.key);
        }
        return info;
    });
}
function run(name) {
    return __awaiter(this, void 0, void 0, function* () {
        fs.mkdirpSync(`cache`);
        let npm = yield explore(name, '*');
        fs.writeJsonSync('../output.json', [...allNodes.values()]);
    });
}
let start = process.argv[2] || 'npm';
run(start);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsic3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAncmVxdWVzdC1wcm9taXNlLW5hdGl2ZSc7XG5cbmludGVyZmFjZSBWZXJzaW9uIHtcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmVyc2lvbjogc3RyaW5nLFxuICAgIGRlcGVuZGVuY2llczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0sXG59XG5cbmludGVyZmFjZSBQYWNrYWdlIHtcbiAgICB2ZXJzaW9uczogeyBbdmVyc2lvbjogc3RyaW5nXTogVmVyc2lvbiB9LFxufVxuXG5jb25zdCBrbm93biA9IG5ldyBNYXA8c3RyaW5nLCBQYWNrYWdlPigpO1xuXG5mdW5jdGlvbiBlcnJvcihtc2c6IHN0cmluZykge1xuICAgIGRlYnVnZ2VyO1xuICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRfcGFja2FnZShuYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAoa25vd24uaGFzKG5hbWUpKSB7XG4gICAgICAgIGxldCB4ID0ga25vd24uZ2V0KG5hbWUpITtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuXG4gICAgbGV0IGNhY2hlID0gYGNhY2hlLyR7bmFtZX1gO1xuICAgIGZzLm1rZGlycFN5bmMocGF0aC5kaXJuYW1lKGNhY2hlKSk7XG5cbiAgICBsZXQgZGF0YTogUGFja2FnZTtcbiAgICB0cnkge1xuICAgICAgICBkYXRhID0gZnMucmVhZEpzb25TeW5jKGNhY2hlKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgbGV0IHVybCA9IGBodHRwczovL3JlZ2lzdHJ5Lm5wbWpzLm9yZy8ke25hbWV9YDtcbiAgICAgICAgZGF0YSA9IGF3YWl0IHJlcXVlc3QuZ2V0KHVybCwge1xuICAgICAgICAgICAgaGVhZGVyczogeyAnYWNjZXB0JzogJ2FwcGxpY2F0aW9uL3ZuZC5ucG0uaW5zdGFsbC12MStqc29uJyB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnKSBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgZnMud3JpdGVKc29uU3luYyhjYWNoZSwgZGF0YSk7XG4gICAgfVxuXG4gICAga25vd24uc2V0KG5hbWUsIGRhdGEpO1xuICAgIHJldHVybiBkYXRhO1xufVxuXG5pbnRlcmZhY2UgRGVwIHtcbiAgICBrZXk6IHN0cmluZyxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdmVyc2lvbjogc3RyaW5nLFxuICAgIGRlcHM6IHN0cmluZ1tdLFxufVxuXG5jb25zdCBhbGxOb2RlcyA9IG5ldyBNYXA8c3RyaW5nLCBEZXA+KCk7XG5cbmFzeW5jIGZ1bmN0aW9uIGV4cGxvcmUobmFtZTogc3RyaW5nLCByYW5nZTogc3RyaW5nKTogUHJvbWlzZTxEZXA+IHtcbiAgICBsZXQgcGFjayA9IGF3YWl0IGdldF9wYWNrYWdlKG5hbWUpO1xuXG4gICAgbGV0IHZlcnNpb25zID0gT2JqZWN0LmtleXMocGFjay52ZXJzaW9ucylcblxuICAgIGxldCBtYXRjaCA9IHNlbXZlci5tYXhTYXRpc2Z5aW5nKHZlcnNpb25zLCByYW5nZSk7XG4gICAgaWYgKG1hdGNoID09IG51bGwpIHRocm93IGVycm9yKCdubyBtYXRjaGluZyB2ZXJzaW9uJyk7XG5cbiAgICBsZXQgdGFyZ2V0ID0gcGFjay52ZXJzaW9uc1ttYXRjaF07XG5cbiAgICBsZXQgaW5mbyA9IGFsbE5vZGVzLmdldChuYW1lICsgJyAnICsgbWF0Y2gpO1xuICAgIGlmIChpbmZvKSByZXR1cm4gaW5mbztcblxuICAgIGFsbE5vZGVzLnNldChuYW1lICsgJyAnICsgbWF0Y2gsIGluZm8gPSB7XG4gICAgICAgIGtleTogbmFtZSArICcgJyArIG1hdGNoLFxuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICB2ZXJzaW9uOiBtYXRjaCxcbiAgICAgICAgZGVwczogW10sXG4gICAgfSk7XG5cbiAgICBmb3IgKGxldCBkZXAgaW4gdGFyZ2V0LmRlcGVuZGVuY2llcykge1xuICAgICAgICBsZXQgZm91bmQgPSBhd2FpdCBleHBsb3JlKGRlcCwgdGFyZ2V0LmRlcGVuZGVuY2llc1tkZXBdKTtcbiAgICAgICAgaW5mby5kZXBzLnB1c2goZm91bmQua2V5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5mbztcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuKG5hbWU6IHN0cmluZykge1xuICAgIGZzLm1rZGlycFN5bmMoYGNhY2hlYCk7XG5cbiAgICBsZXQgbnBtID0gYXdhaXQgZXhwbG9yZShuYW1lLCAnKicpO1xuXG4gICAgZnMud3JpdGVKc29uU3luYygnLi4vb3V0cHV0Lmpzb24nLCBbLi4uYWxsTm9kZXMudmFsdWVzKCldKTtcbn1cblxubGV0IHN0YXJ0ID0gcHJvY2Vzcy5hcmd2WzJdIHx8ICducG0nO1xuXG5ydW4oc3RhcnQpO1xuIl0sIm5hbWVzIjpbInBhdGguZGlybmFtZSIsInNlbXZlci5tYXhTYXRpc2Z5aW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7QUFFekMsU0FBUyxLQUFLLENBQUMsR0FBVztJQUN0QixTQUFTO0lBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN4QjtBQUVELFNBQWUsV0FBVyxDQUFDLElBQVk7O1FBQ25DLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBRSxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFFRCxJQUFJLEtBQUssR0FBRyxTQUFTLElB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
