"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// TODO: cleanup this file, it's copied as is from Angular CLI.
const core_1 = require("@angular-devkit/core");
const crypto = require("crypto");
const fs = require("fs");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const semver = require("semver");
const require_project_module_1 = require("../require-project-module");
exports.NEW_SW_VERSION = '5.0.0-rc.0';
class CliFilesystem {
    constructor(_host, base) {
        this._host = _host;
        this.base = base;
    }
    list(path) {
        const recursiveList = (path) => this._host.list(path).pipe(
        // Emit each fragment individually.
        operators_1.concatMap(fragments => rxjs_1.from(fragments)), 
        // Join the path with fragment.
        operators_1.map(fragment => core_1.join(path, fragment)), 
        // Emit directory content paths instead of the directory path.
        operators_1.mergeMap(path => this._host.isDirectory(path).pipe(operators_1.concatMap(isDir => isDir ? recursiveList(path) : rxjs_1.of(path)))));
        return recursiveList(this._resolve(path)).pipe(operators_1.map(path => path.replace(this.base, '')), operators_1.toArray()).toPromise().then(x => x, _err => []);
    }
    read(path) {
        return this._readIntoBuffer(path)
            .then(content => core_1.virtualFs.fileBufferToString(content));
    }
    hash(path) {
        const sha1 = crypto.createHash('sha1');
        return this._readIntoBuffer(path)
            .then(content => sha1.update(Buffer.from(content)))
            .then(() => sha1.digest('hex'));
    }
    write(path, content) {
        return this._host.write(this._resolve(path), core_1.virtualFs.stringToFileBuffer(content))
            .toPromise();
    }
    _readIntoBuffer(path) {
        return this._host.read(this._resolve(path))
            .toPromise();
    }
    _resolve(path) {
        return core_1.join(core_1.normalize(this.base), path);
    }
}
function usesServiceWorker(projectRoot) {
    let swPackageJsonPath;
    try {
        swPackageJsonPath = require_project_module_1.resolveProjectModule(projectRoot, '@angular/service-worker/package.json');
    }
    catch (_) {
        // @angular/service-worker is not installed
        throw new Error(core_1.tags.stripIndent `
    Your project is configured with serviceWorker = true, but @angular/service-worker
    is not installed. Run \`npm install --save-dev @angular/service-worker\`
    and try again, or run \`ng set apps.0.serviceWorker=false\` in your .angular-cli.json.
  `);
    }
    const swPackageJson = fs.readFileSync(swPackageJsonPath).toString();
    const swVersion = JSON.parse(swPackageJson)['version'];
    if (!semver.gte(swVersion, exports.NEW_SW_VERSION)) {
        throw new Error(core_1.tags.stripIndent `
    The installed version of @angular/service-worker is ${swVersion}. This version of the CLI
    requires the @angular/service-worker version to satisfy ${exports.NEW_SW_VERSION}. Please upgrade
    your service worker version.
  `);
    }
    return true;
}
exports.usesServiceWorker = usesServiceWorker;
function augmentAppWithServiceWorker(host, projectRoot, appRoot, outputPath, baseHref, ngswConfigPath) {
    // Path to the worker script itself.
    const distPath = core_1.normalize(outputPath);
    const workerPath = core_1.normalize(require_project_module_1.resolveProjectModule(core_1.getSystemPath(projectRoot), '@angular/service-worker/ngsw-worker.js'));
    const swConfigPath = require_project_module_1.resolveProjectModule(core_1.getSystemPath(projectRoot), '@angular/service-worker/config');
    const safetyPath = core_1.join(core_1.dirname(workerPath), 'safety-worker.js');
    const configPath = ngswConfigPath || core_1.join(appRoot, 'ngsw-config.json');
    return host.exists(configPath).pipe(operators_1.switchMap(exists => {
        if (!exists) {
            throw new Error(core_1.tags.oneLine `
          Error: Expected to find an ngsw-config.json configuration
          file in the ${appRoot} folder. Either provide one or disable Service Worker
          in your angular.json configuration file.`);
        }
        return host.read(configPath);
    }), operators_1.map(content => JSON.parse(core_1.virtualFs.fileBufferToString(content))), operators_1.switchMap(configJson => {
        const GeneratorConstructor = require(swConfigPath).Generator;
        const gen = new GeneratorConstructor(new CliFilesystem(host, outputPath), baseHref);
        return gen.process(configJson);
    }), operators_1.switchMap(output => {
        const manifest = JSON.stringify(output, null, 2);
        return host.read(workerPath).pipe(operators_1.switchMap(workerCode => {
            return rxjs_1.merge(host.write(core_1.join(distPath, 'ngsw.json'), core_1.virtualFs.stringToFileBuffer(manifest)), host.write(core_1.join(distPath, 'ngsw-worker.js'), workerCode));
        }));
    }), operators_1.switchMap(() => host.exists(safetyPath)), 
    // If @angular/service-worker has the safety script, copy it into two locations.
    operators_1.switchMap(exists => {
        if (!exists) {
            return rxjs_1.of(undefined);
        }
        return host.read(safetyPath).pipe(operators_1.switchMap(safetyCode => {
            return rxjs_1.merge(host.write(core_1.join(distPath, 'worker-basic.min.js'), safetyCode), host.write(core_1.join(distPath, 'safety-worker.js'), safetyCode));
        }));
    }), 
    // Remove all elements, reduce them to a single emit.
    operators_1.reduce(() => { })).toPromise();
}
exports.augmentAppWithServiceWorker = augmentAppWithServiceWorker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2FuZ3VsYXItY2xpLWZpbGVzL3V0aWxpdGllcy9zZXJ2aWNlLXdvcmtlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtEQUErRDtBQUMvRCwrQ0FROEI7QUFLOUIsaUNBQWlDO0FBQ2pDLHlCQUF5QjtBQUN6QiwrQkFBbUQ7QUFDbkQsOENBQXNGO0FBQ3RGLGlDQUFpQztBQUNqQyxzRUFBaUU7QUFHcEQsUUFBQSxjQUFjLEdBQUcsWUFBWSxDQUFDO0FBRzNDLE1BQU0sYUFBYTtJQUNqQixZQUFvQixLQUFxQixFQUFVLElBQVk7UUFBM0MsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFRO0lBQUksQ0FBQztJQUVwRSxJQUFJLENBQUMsSUFBWTtRQUNmLE1BQU0sYUFBYSxHQUFHLENBQUMsSUFBVSxFQUFvQixFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSTtRQUNoRixtQ0FBbUM7UUFDbkMscUJBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFdBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2QywrQkFBK0I7UUFDL0IsZUFBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsV0FBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyQyw4REFBOEQ7UUFDOUQsb0JBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FDOUMscUJBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMs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SSxDQUFDLEtBQUssQ0FBQyxXQUFJLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLEVBQUUsVUFBVSxDQUFDLENBQ3ZDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVGLHFEQUFxRDtJQUNyRCxrQkFBTSxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUNqQixDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2hCLENBQUM7QUF6RUQsa0VBeUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuLy8gVE9ETzogY2xlYW51cCB0aGlzIGZpbGUsIGl0J3MgY29waWVkIGFzIGlzIGZyb20gQW5ndWxhciBDTEkuXG5pbXBvcnQge1xuICBQYXRoLFxuICBkaXJuYW1lLFxuICBnZXRTeXN0ZW1QYXRoLFxuICBqb2luLFxuICBub3JtYWxpemUsXG4gIHRhZ3MsXG4gIHZpcnR1YWxGcyxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtcbiAgRmlsZXN5c3RlbSxcbiAgR2VuZXJhdG9yLFxufSBmcm9tICdAYW5ndWxhci9zZXJ2aWNlLXdvcmtlci9jb25maWcnOyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWltcGxpY2l0LWRlcGVuZGVuY2llc1xuaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tLCBtZXJnZSwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNvbmNhdE1hcCwgbWFwLCBtZXJnZU1hcCwgcmVkdWNlLCBzd2l0Y2hNYXAsIHRvQXJyYXkgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7IHJlc29sdmVQcm9qZWN0TW9kdWxlIH0gZnJvbSAnLi4vcmVxdWlyZS1wcm9qZWN0LW1vZHVsZSc7XG5cblxuZXhwb3J0IGNvbnN0IE5FV19TV19WRVJTSU9OID0gJzUuMC4wLXJjLjAnO1xuXG5cbmNsYXNzIENsaUZpbGVzeXN0ZW0gaW1wbGVtZW50cyBGaWxlc3lzdGVtIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaG9zdDogdmlydHVhbEZzLkhvc3QsIHByaXZhdGUgYmFzZTogc3RyaW5nKSB7IH1cblxuICBsaXN0KHBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCByZWN1cnNpdmVMaXN0ID0gKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPFBhdGg+ID0+IHRoaXMuX2hvc3QubGlzdChwYXRoKS5waXBlKFxuICAgICAgLy8gRW1pdCBlYWNoIGZyYWdtZW50IGluZGl2aWR1YWxseS5cbiAgICAgIGNvbmNhdE1hcChmcmFnbWVudHMgPT4gZnJvbShmcmFnbWVudHMpKSxcbiAgICAgIC8vIEpvaW4gdGhlIHBhdGggd2l0aCBmcmFnbWVudC5cbiAgICAgIG1hcChmcmFnbWVudCA9PiBqb2luKHBhdGgsIGZyYWdtZW50KSksXG4gICAgICAvLyBFbWl0IGRpcmVjdG9yeSBjb250ZW50IHBhdGhzIGluc3RlYWQgb2YgdGhlIGRpcmVjdG9yeSBwYXRoLlxuICAgICAgbWVyZ2VNYXAocGF0aCA9PiB0aGlzLl9ob3N0LmlzRGlyZWN0b3J5KHBhdGgpLnBpcGUoXG4gICAgICAgICAgY29uY2F0TWFwKGlzRGlyID0+IGlzRGlyID8gcmVjdXJzaXZlTGlzdChwYXRoKSA6IG9mKHBhdGgpKSxcbiAgICAgICAgKSxcbiAgICAgICksXG4gICAgKTtcblxuICAgIHJldHVybiByZWN1cnNpdmVMaXN0KHRoaXMuX3Jlc29sdmUocGF0aCkpLnBpcGUoXG4gICAgICBtYXAocGF0aCA9PiBwYXRoLnJlcGxhY2UodGhpcy5iYXNlLCAnJykpLFxuICAgICAgdG9BcnJheSgpLFxuICAgICkudG9Qcm9taXNlKCkudGhlbih4ID0+IHgsIF9lcnIgPT4gW10pO1xuICB9XG5cbiAgcmVhZChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9yZWFkSW50b0J1ZmZlcihwYXRoKVxuICAgICAgLnRoZW4oY29udGVudCA9PiB2aXJ0dWFsRnMuZmlsZUJ1ZmZlclRvU3RyaW5nKGNvbnRlbnQpKTtcbiAgfVxuXG4gIGhhc2gocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBzaGExID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTEnKTtcblxuICAgIHJldHVybiB0aGlzLl9yZWFkSW50b0J1ZmZlcihwYXRoKVxuICAgICAgLnRoZW4oY29udGVudCA9PiBzaGExLnVwZGF0ZShCdWZmZXIuZnJvbShjb250ZW50KSkpXG4gICAgICAudGhlbigoKSA9PiBzaGExLmRpZ2VzdCgnaGV4JykpO1xuICB9XG5cbiAgd3JpdGUocGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5faG9zdC53cml0ZSh0aGlzLl9yZXNvbHZlKHBhdGgpLCB2aXJ0dWFsRnMuc3RyaW5nVG9GaWxlQnVmZmVyKGNvbnRlbnQpKVxuICAgICAgLnRvUHJvbWlzZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVhZEludG9CdWZmZXIocGF0aDogc3RyaW5nKTogUHJvbWlzZTx2aXJ0dWFsRnMuRmlsZUJ1ZmZlcj4ge1xuICAgIHJldHVybiB0aGlzLl9ob3N0LnJlYWQodGhpcy5fcmVzb2x2ZShwYXRoKSlcbiAgICAgIC50b1Byb21pc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc29sdmUocGF0aDogc3RyaW5nKTogUGF0aCB7XG4gICAgcmV0dXJuIGpvaW4obm9ybWFsaXplKHRoaXMuYmFzZSksIHBhdGgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VzU2VydmljZVdvcmtlcihwcm9qZWN0Um9vdDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGxldCBzd1BhY2thZ2VKc29uUGF0aDtcblxuICB0cnkge1xuICAgIHN3UGFja2FnZUpzb25QYXRoID0gcmVzb2x2ZVByb2plY3RNb2R1bGUocHJvamVjdFJvb3QsICdAYW5ndWxhci9zZXJ2aWNlLXdvcmtlci9wYWNrYWdlLmpzb24nKTtcbiAgfSBjYXRjaCAoXykge1xuICAgIC8vIEBhbmd1bGFyL3NlcnZpY2Utd29ya2VyIGlzIG5vdCBpbnN0YWxsZWRcbiAgICB0aHJvdyBuZXcgRXJyb3IodGFncy5zdHJpcEluZGVudGBcbiAgICBZb3VyIHByb2plY3QgaXMgY29uZmlndXJlZCB3aXRoIHNlcnZpY2VXb3JrZXIgPSB0cnVlLCBidXQgQGFuZ3VsYXIvc2VydmljZS13b3JrZXJcbiAgICBpcyBub3QgaW5zdGFsbGVkLiBSdW4gXFxgbnBtIGluc3RhbGwgLS1zYXZlLWRldiBAYW5ndWxhci9zZXJ2aWNlLXdvcmtlclxcYFxuICAgIGFuZCB0cnkgYWdhaW4sIG9yIHJ1biBcXGBuZyBzZXQgYXBwcy4wLnNlcnZpY2VXb3JrZXI9ZmFsc2VcXGAgaW4geW91ciAuYW5ndWxhci1jbGkuanNvbi5cbiAgYCk7XG4gIH1cblxuICBjb25zdCBzd1BhY2thZ2VKc29uID0gZnMucmVhZEZpbGVTeW5jKHN3UGFja2FnZUpzb25QYXRoKS50b1N0cmluZygpO1xuICBjb25zdCBzd1ZlcnNpb24gPSBKU09OLnBhcnNlKHN3UGFja2FnZUpzb24pWyd2ZXJzaW9uJ107XG5cbiAgaWYgKCFzZW12ZXIuZ3RlKHN3VmVyc2lvbiwgTkVXX1NXX1ZFUlNJT04pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHRhZ3Muc3RyaXBJbmRlbnRgXG4gICAgVGhlIGluc3RhbGxlZCB2ZXJzaW9uIG9mIEBhbmd1bGFyL3NlcnZpY2Utd29ya2VyIGlzICR7c3dWZXJzaW9ufS4gVGhpcyB2ZXJzaW9uIG9mIHRoZSBDTElcbiAgICByZXF1aXJlcyB0aGUgQGFuZ3VsYXIvc2VydmljZS13b3JrZXIgdmVyc2lvbiB0byBzYXRpc2Z5ICR7TkVXX1NXX1ZFUlNJT059LiBQbGVhc2UgdXBncmFkZVxuICAgIHlvdXIgc2VydmljZSB3b3JrZXIgdmVyc2lvbi5cbiAgYCk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1Z21lbnRBcHBXaXRoU2VydmljZVdvcmtlcihcbiAgaG9zdDogdmlydHVhbEZzLkhvc3QsXG4gIHByb2plY3RSb290OiBQYXRoLFxuICBhcHBSb290OiBQYXRoLFxuICBvdXRwdXRQYXRoOiBQYXRoLFxuICBiYXNlSHJlZjogc3RyaW5nLFxuICBuZ3N3Q29uZmlnUGF0aD86IHN0cmluZyxcbik6IFByb21pc2U8dm9pZD4ge1xuICAvLyBQYXRoIHRvIHRoZSB3b3JrZXIgc2NyaXB0IGl0c2VsZi5cbiAgY29uc3QgZGlzdFBhdGggPSBub3JtYWxpemUob3V0cHV0UGF0aCk7XG4gIGNvbnN0IHdvcmtlclBhdGggPSBub3JtYWxpemUoXG4gICAgcmVzb2x2ZVByb2plY3RNb2R1bGUoZ2V0U3lzdGVtUGF0aChwcm9qZWN0Um9vdCksICdAYW5ndWxhci9zZXJ2aWNlLXdvcmtlci9uZ3N3LXdvcmtlci5qcycpLFxuICApO1xuICBjb25zdCBzd0NvbmZpZ1BhdGggPSByZXNvbHZlUHJvamVjdE1vZHVsZShcbiAgICBnZXRTeXN0ZW1QYXRoKHByb2plY3RSb290KSxcbiAgICAnQGFuZ3VsYXIvc2VydmljZS13b3JrZXIvY29uZmlnJyxcbiAgKTtcbiAgY29uc3Qgc2FmZXR5UGF0aCA9IGpvaW4oZGlybmFtZSh3b3JrZXJQYXRoKSwgJ3NhZmV0eS13b3JrZXIuanMnKTtcbiAgY29uc3QgY29uZmlnUGF0aCA9IG5nc3dDb25maWdQYXRoIGFzIFBhdGggfHwgam9pbihhcHBSb290LCAnbmdzdy1jb25maWcuanNvbicpO1xuXG4gIHJldHVybiBob3N0LmV4aXN0cyhjb25maWdQYXRoKS5waXBlKFxuICAgIHN3aXRjaE1hcChleGlzdHMgPT4ge1xuICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRhZ3Mub25lTGluZWBcbiAgICAgICAgICBFcnJvcjogRXhwZWN0ZWQgdG8gZmluZCBhbiBuZ3N3LWNvbmZpZy5qc29uIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICBmaWxlIGluIHRoZSAke2FwcFJvb3R9IGZvbGRlci4gRWl0aGVyIHByb3ZpZGUgb25lIG9yIGRpc2FibGUgU2VydmljZSBXb3JrZXJcbiAgICAgICAgICBpbiB5b3VyIGFuZ3VsYXIuanNvbiBjb25maWd1cmF0aW9uIGZpbGUuYCxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGhvc3QucmVhZChjb25maWdQYXRoKSBhcyBPYnNlcnZhYmxlPHZpcnR1YWxGcy5GaWxlQnVmZmVyPjtcbiAgICB9KSxcbiAgICBtYXAoY29udGVudCA9PiBKU09OLnBhcnNlKHZpcnR1YWxGcy5maWxlQnVmZmVyVG9TdHJpbmcoY29udGVudCkpKSxcbiAgICBzd2l0Y2hNYXAoY29uZmlnSnNvbiA9PiB7XG4gICAgICBjb25zdCBHZW5lcmF0b3JDb25zdHJ1Y3RvciA9IHJlcXVpcmUoc3dDb25maWdQYXRoKS5HZW5lcmF0b3IgYXMgdHlwZW9mIEdlbmVyYXRvcjtcbiAgICAgIGNvbnN0IGdlbiA9IG5ldyBHZW5lcmF0b3JDb25zdHJ1Y3RvcihuZXcgQ2xpRmlsZXN5c3RlbShob3N0LCBvdXRwdXRQYXRoKSwgYmFzZUhyZWYpO1xuXG4gICAgICByZXR1cm4gZ2VuLnByb2Nlc3MoY29uZmlnSnNvbik7XG4gICAgfSksXG5cbiAgICBzd2l0Y2hNYXAob3V0cHV0ID0+IHtcbiAgICAgIGNvbnN0IG1hbmlmZXN0ID0gSlNPTi5zdHJpbmdpZnkob3V0cHV0LCBudWxsLCAyKTtcblxuICAgICAgcmV0dXJuIGhvc3QucmVhZCh3b3JrZXJQYXRoKS5waXBlKFxuICAgICAgICBzd2l0Y2hNYXAod29ya2VyQ29kZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1lcmdlKFxuICAgICAgICAgICAgaG9zdC53cml0ZShqb2luKGRpc3RQYXRoLCAnbmdzdy5qc29uJyksIHZpcnR1YWxGcy5zdHJpbmdUb0ZpbGVCdWZmZXIobWFuaWZlc3QpKSxcbiAgICAgICAgICAgIGhvc3Qud3JpdGUoam9pbihkaXN0UGF0aCwgJ25nc3ctd29ya2VyLmpzJyksIHdvcmtlckNvZGUpLFxuICAgICAgICAgICkgYXMgT2JzZXJ2YWJsZTx2b2lkPjtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0pLFxuXG4gICAgc3dpdGNoTWFwKCgpID0+IGhvc3QuZXhpc3RzKHNhZmV0eVBhdGgpKSxcbiAgICAvLyBJZiBAYW5ndWxhci9zZXJ2aWNlLXdvcmtlciBoYXMgdGhlIHNhZmV0eSBzY3JpcHQsIGNvcHkgaXQgaW50byB0d28gbG9jYXRpb25zLlxuICAgIHN3aXRjaE1hcChleGlzdHMgPT4ge1xuICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgcmV0dXJuIG9mPHZvaWQ+KHVuZGVmaW5lZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBob3N0LnJlYWQoc2FmZXR5UGF0aCkucGlwZShcbiAgICAgICAgc3dpdGNoTWFwKHNhZmV0eUNvZGUgPT4ge1xuICAgICAgICAgIHJldHVybiBtZXJnZShcbiAgICAgICAgICAgIGhvc3Qud3JpdGUoam9pbihkaXN0UGF0aCwgJ3dvcmtlci1iYXNpYy5taW4uanMnKSwgc2FmZXR5Q29kZSksXG4gICAgICAgICAgICBob3N0LndyaXRlKGpvaW4oZGlzdFBhdGgsICdzYWZldHktd29ya2VyLmpzJyksIHNhZmV0eUNvZGUpLFxuICAgICAgICAgICkgYXMgT2JzZXJ2YWJsZTx2b2lkPjtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0pLFxuXG4gICAgLy8gUmVtb3ZlIGFsbCBlbGVtZW50cywgcmVkdWNlIHRoZW0gdG8gYSBzaW5nbGUgZW1pdC5cbiAgICByZWR1Y2UoKCkgPT4ge30pLFxuICApLnRvUHJvbWlzZSgpO1xufVxuIl19