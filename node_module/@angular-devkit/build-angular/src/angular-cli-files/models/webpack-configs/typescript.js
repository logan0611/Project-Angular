"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack_1 = require("@ngtools/webpack");
const common_1 = require("./common");
const g = typeof global !== 'undefined' ? global : {};
const webpackLoader = g['_DevKitIsLocal']
    ? require.resolve('@ngtools/webpack')
    : '@ngtools/webpack';
function _createAotPlugin(wco, options, _host, useMain = true, extract = false) {
    const { root, buildOptions } = wco;
    options.compilerOptions = options.compilerOptions || {};
    if (wco.buildOptions.preserveSymlinks) {
        options.compilerOptions.preserveSymlinks = true;
    }
    let i18nInFile = buildOptions.i18nFile
        ? path.resolve(root, buildOptions.i18nFile)
        : undefined;
    const i18nFileAndFormat = extract
        ? {
            i18nOutFile: buildOptions.i18nFile,
            i18nOutFormat: buildOptions.i18nFormat,
        } : {
        i18nInFile: i18nInFile,
        i18nInFormat: buildOptions.i18nFormat,
    };
    const additionalLazyModules = {};
    if (buildOptions.lazyModules) {
        for (const lazyModule of buildOptions.lazyModules) {
            additionalLazyModules[lazyModule] = path.resolve(root, lazyModule);
        }
    }
    const hostReplacementPaths = {};
    if (buildOptions.fileReplacements) {
        for (const replacement of buildOptions.fileReplacements) {
            hostReplacementPaths[replacement.replace] = replacement.with;
        }
    }
    const pluginOptions = Object.assign({ mainPath: useMain ? path.join(root, buildOptions.main) : undefined }, i18nFileAndFormat, { locale: buildOptions.i18nLocale, platform: buildOptions.platform === 'server' ? webpack_1.PLATFORM.Server : webpack_1.PLATFORM.Browser, missingTranslation: buildOptions.i18nMissingTranslation, sourceMap: buildOptions.sourceMap, additionalLazyModules,
        hostReplacementPaths, nameLazyFiles: buildOptions.namedChunks, forkTypeChecker: buildOptions.forkTypeChecker, contextElementDependencyConstructor: require('webpack/lib/dependencies/ContextElementDependency'), logger: wco.logger }, options);
    return new webpack_1.AngularCompilerPlugin(pluginOptions);
}
function getNonAotConfig(wco, host) {
    const { tsConfigPath } = wco;
    return {
        module: { rules: [{ test: /\.tsx?$/, loader: webpackLoader }] },
        plugins: [_createAotPlugin(wco, { tsConfigPath, skipCodeGeneration: true }, host)]
    };
}
exports.getNonAotConfig = getNonAotConfig;
function getAotConfig(wco, host, extract = false) {
    const { tsConfigPath, buildOptions } = wco;
    const loaders = [webpackLoader];
    if (buildOptions.buildOptimizer) {
        loaders.unshift({
            loader: common_1.buildOptimizerLoader,
            options: { sourceMap: buildOptions.sourceMap }
        });
    }
    const test = /(?:\.ngfactory\.js|\.ngstyle\.js|\.tsx?)$/;
    return {
        module: { rules: [{ test, use: loaders }] },
        plugins: [_createAotPlugin(wco, { tsConfigPath }, host, true, extract)]
    };
}
exports.getAotConfig = getAotConfig;
function getNonAotTestConfig(wco, host) {
    const { tsConfigPath } = wco;
    return {
        module: { rules: [{ test: /\.tsx?$/, loader: webpackLoader }] },
        plugins: [_createAotPlugin(wco, { tsConfigPath, skipCodeGeneration: true }, host, false)]
    };
}
exports.getNonAotTestConfig = getNonAotTestConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYW5ndWxhci1jbGktZmlsZXMvbW9kZWxzL3dlYnBhY2stY29uZmlncy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBV0EsNkJBQTZCO0FBQzdCLDhDQUkwQjtBQUMxQixxQ0FBZ0Q7QUFJaEQsTUFBTSxDQUFDLEdBQVEsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMzRCxNQUFNLGFBQWEsR0FBVyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7SUFDL0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUM7SUFDckMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDO0FBR3ZCLFNBQVMsZ0JBQWdCLENBQ3ZCLEdBQXlCLEVBQ3pCLE9BQVksRUFDWixLQUE0QixFQUM1QixPQUFPLEdBQUcsSUFBSSxFQUNkLE9BQU8sR0FBRyxLQUFLO0lBRWYsTUFBTSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDbkMsT0FBTyxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQztJQUV4RCxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUU7UUFDckMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7S0FDakQ7SUFFRCxJQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsUUFBUTtRQUNwQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLFFBQVEsQ0FBQztRQUMzQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBRWQsTUFBTSxpQkFBaUIsR0FBRyxPQUFPO1FBQy9CLENBQUMsQ0FBQztZ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RUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtRQUMzQyxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3hFLENBQUM7QUFDSixDQUFDO0FBckJELG9DQXFCQztBQUVELFNBQWdCLG1CQUFtQixDQUFDLEdBQXlCLEVBQUUsSUFBMkI7SUFDeEYsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLEdBQUcsQ0FBQztJQUU3QixPQUFPO1FBQ0wsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFO1FBQy9ELE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDMUYsQ0FBQztBQUNKLENBQUM7QUFQRCxrREFPQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vIHRzbGludDpkaXNhYmxlXG4vLyBUT0RPOiBjbGVhbnVwIHRoaXMgZmlsZSwgaXQncyBjb3BpZWQgYXMgaXMgZnJvbSBBbmd1bGFyIENMSS5cbmltcG9ydCB7IHZpcnR1YWxGcyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IFN0YXRzIH0gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7XG4gIEFuZ3VsYXJDb21waWxlclBsdWdpbixcbiAgQW5ndWxhckNvbXBpbGVyUGx1Z2luT3B0aW9ucyxcbiAgUExBVEZPUk1cbn0gZnJvbSAnQG5ndG9vbHMvd2VicGFjayc7XG5pbXBvcnQgeyBidWlsZE9wdGltaXplckxvYWRlciB9IGZyb20gJy4vY29tbW9uJztcbmltcG9ydCB7IFdlYnBhY2tDb25maWdPcHRpb25zIH0gZnJvbSAnLi4vYnVpbGQtb3B0aW9ucyc7XG5cblxuY29uc3QgZzogYW55ID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB7fTtcbmNvbnN0IHdlYnBhY2tMb2FkZXI6IHN0cmluZyA9IGdbJ19EZXZLaXRJc0xvY2FsJ11cbiAgPyByZXF1aXJlLnJlc29sdmUoJ0BuZ3Rvb2xzL3dlYnBhY2snKVxuICA6ICdAbmd0b29scy93ZWJwYWNrJztcblxuXG5mdW5jdGlvbiBfY3JlYXRlQW90UGx1Z2luKFxuICB3Y286IFdlYnBhY2tDb25maWdPcHRpb25zLFxuICBvcHRpb25zOiBhbnksXG4gIF9ob3N0OiB2aXJ0dWFsRnMuSG9zdDxTdGF0cz4sXG4gIHVzZU1haW4gPSB0cnVlLFxuICBleHRyYWN0ID0gZmFsc2UsXG4pIHtcbiAgY29uc3QgeyByb290LCBidWlsZE9wdGlvbnMgfSA9IHdjbztcbiAgb3B0aW9ucy5jb21waWxlck9wdGlvbnMgPSBvcHRpb25zLmNvbXBpbGVyT3B0aW9ucyB8fCB7fTtcblxuICBpZiAod2NvLmJ1aWxkT3B0aW9ucy5wcmVzZXJ2ZVN5bWxpbmtzKSB7XG4gICAgb3B0aW9ucy5jb21waWxlck9wdGlvbnMucHJlc2VydmVTeW1saW5rcyA9IHRydWU7XG4gIH1cblxuICBsZXQgaTE4bkluRmlsZSA9IGJ1aWxkT3B0aW9ucy5pMThuRmlsZVxuICAgID8gcGF0aC5yZXNvbHZlKHJvb3QsIGJ1aWxkT3B0aW9ucy5pMThuRmlsZSlcbiAgICA6IHVuZGVmaW5lZDtcblxuICBjb25zdCBpMThuRmlsZUFuZEZvcm1hdCA9IGV4dHJhY3RcbiAgICA/IHtcbiAgICAgIGkxOG5PdXRGaWxlOiBidWlsZE9wdGlvbnMuaTE4bkZpbGUsXG4gICAgICBpMThuT3V0Rm9ybWF0OiBidWlsZE9wdGlvbnMuaTE4bkZvcm1hdCxcbiAgICB9IDoge1xuICAgICAgaTE4bkluRmlsZTogaTE4bkluRmlsZSxcbiAgICAgIGkxOG5JbkZvcm1hdDogYnVpbGRPcHRpb25zLmkxOG5Gb3JtYXQsXG4gICAgfTtcblxuICBjb25zdCBhZGRpdGlvbmFsTGF6eU1vZHVsZXM6IHsgW21vZHVsZTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgaWYgKGJ1aWxkT3B0aW9ucy5sYXp5TW9kdWxlcykge1xuICAgIGZvciAoY29uc3QgbGF6eU1vZHVsZSBvZiBidWlsZE9wdGlvbnMubGF6eU1vZHVsZXMpIHtcbiAgICAgIGFkZGl0aW9uYWxMYXp5TW9kdWxlc1tsYXp5TW9kdWxlXSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgcm9vdCxcbiAgICAgICAgbGF6eU1vZHVsZSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaG9zdFJlcGxhY2VtZW50UGF0aHM6IHsgW3JlcGxhY2U6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG4gIGlmIChidWlsZE9wdGlvbnMuZmlsZVJlcGxhY2VtZW50cykge1xuICAgIGZvciAoY29uc3QgcmVwbGFjZW1lbnQgb2YgYnVpbGRPcHRpb25zLmZpbGVSZXBsYWNlbWVudHMpIHtcbiAgICAgIGhvc3RSZXBsYWNlbWVudFBhdGhzW3JlcGxhY2VtZW50LnJlcGxhY2VdID0gcmVwbGFjZW1lbnQud2l0aDtcbiAgICB9XG4gIH1cblxuICBjb25zdCBwbHVnaW5PcHRpb25zOiBBbmd1bGFyQ29tcGlsZXJQbHVnaW5PcHRpb25zID0ge1xuICAgIG1haW5QYXRoOiB1c2VNYWluID8gcGF0aC5qb2luKHJvb3QsIGJ1aWxkT3B0aW9ucy5tYWluKSA6IHVuZGVmaW5lZCxcbiAgICAuLi5pMThuRmlsZUFuZEZvcm1hdCxcbiAgICBsb2NhbGU6IGJ1aWxkT3B0aW9ucy5pMThuTG9jYWxlLFxuICAgIHBsYXRmb3JtOiBidWlsZE9wdGlvbnMucGxhdGZvcm0gPT09ICdzZXJ2ZXInID8gUExBVEZPUk0uU2VydmVyIDogUExBVEZPUk0uQnJvd3NlcixcbiAgICBtaXNzaW5nVHJhbnNsYXRpb246IGJ1aWxkT3B0aW9ucy5pMThuTWlzc2luZ1RyYW5zbGF0aW9uLFxuICAgIHNvdXJjZU1hcDogYnVpbGRPcHRpb25zLnNvdXJjZU1hcCxcbiAgICBhZGRpdGlvbmFsTGF6eU1vZHVsZXMsXG4gICAgaG9zdFJlcGxhY2VtZW50UGF0aHMsXG4gICAgbmFtZUxhenlGaWxlczogYnVpbGRPcHRpb25zLm5hbWVkQ2h1bmtzLFxuICAgIGZvcmtUeXBlQ2hlY2tlcjogYnVpbGRPcHRpb25zLmZvcmtUeXBlQ2hlY2tlcixcbiAgICBjb250ZXh0RWxlbWVudERlcGVuZGVuY3lDb25zdHJ1Y3RvcjogcmVxdWlyZSgnd2VicGFjay9saWIvZGVwZW5kZW5jaWVzL0NvbnRleHRFbGVtZW50RGVwZW5kZW5jeScpLFxuICAgIGxvZ2dlcjogd2NvLmxvZ2dlcixcbiAgICAuLi5vcHRpb25zLFxuICB9O1xuICByZXR1cm4gbmV3IEFuZ3VsYXJDb21waWxlclBsdWdpbihwbHVnaW5PcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vbkFvdENvbmZpZyh3Y286IFdlYnBhY2tDb25maWdPcHRpb25zLCBob3N0OiB2aXJ0dWFsRnMuSG9zdDxTdGF0cz4pIHtcbiAgY29uc3QgeyB0c0NvbmZpZ1BhdGggfSA9IHdjbztcblxuICByZXR1cm4ge1xuICAgIG1vZHVsZTogeyBydWxlczogW3sgdGVzdDogL1xcLnRzeD8kLywgbG9hZGVyOiB3ZWJwYWNrTG9hZGVyIH1dIH0sXG4gICAgcGx1Z2luczogW19jcmVhdGVBb3RQbHVnaW4od2NvLCB7IHRzQ29uZmlnUGF0aCwgc2tpcENvZGVHZW5lcmF0aW9uOiB0cnVlIH0sIGhvc3QpXVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW90Q29uZmlnKFxuICB3Y286IFdlYnBhY2tDb25maWdPcHRpb25zLFxuICBob3N0OiB2aXJ0dWFsRnMuSG9zdDxTdGF0cz4sXG4gIGV4dHJhY3QgPSBmYWxzZVxuKSB7XG4gIGNvbnN0IHsgdHNDb25maWdQYXRoLCBidWlsZE9wdGlvbnMgfSA9IHdjbztcblxuICBjb25zdCBsb2FkZXJzOiBhbnlbXSA9IFt3ZWJwYWNrTG9hZGVyXTtcbiAgaWYgKGJ1aWxkT3B0aW9ucy5idWlsZE9wdGltaXplcikge1xuICAgIGxvYWRlcnMudW5zaGlmdCh7XG4gICAgICBsb2FkZXI6IGJ1aWxkT3B0aW1pemVyTG9hZGVyLFxuICAgICAgb3B0aW9uczogeyBzb3VyY2VNYXA6IGJ1aWxkT3B0aW9ucy5zb3VyY2VNYXAgfVxuICAgIH0pO1xuICB9XG5cbiAgY29uc3QgdGVzdCA9IC8oPzpcXC5uZ2ZhY3RvcnlcXC5qc3xcXC5uZ3N0eWxlXFwuanN8XFwudHN4PykkLztcblxuICByZXR1cm4ge1xuICAgIG1vZHVsZTogeyBydWxlczogW3sgdGVzdCwgdXNlOiBsb2FkZXJzIH1dIH0sXG4gICAgcGx1Z2luczogW19jcmVhdGVBb3RQbHVnaW4od2NvLCB7IHRzQ29uZmlnUGF0aCB9LCBob3N0LCB0cnVlLCBleHRyYWN0KV1cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vbkFvdFRlc3RDb25maWcod2NvOiBXZWJwYWNrQ29uZmlnT3B0aW9ucywgaG9zdDogdmlydHVhbEZzLkhvc3Q8U3RhdHM+KSB7XG4gIGNvbnN0IHsgdHNDb25maWdQYXRoIH0gPSB3Y287XG5cbiAgcmV0dXJuIHtcbiAgICBtb2R1bGU6IHsgcnVsZXM6IFt7IHRlc3Q6IC9cXC50c3g/JC8sIGxvYWRlcjogd2VicGFja0xvYWRlciB9XSB9LFxuICAgIHBsdWdpbnM6IFtfY3JlYXRlQW90UGx1Z2luKHdjbywgeyB0c0NvbmZpZ1BhdGgsIHNraXBDb2RlR2VuZXJhdGlvbjogdHJ1ZSB9LCBob3N0LCBmYWxzZSldXG4gIH07XG59XG4iXX0=