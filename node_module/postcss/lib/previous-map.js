"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sourceMap = _interopRequireDefault(require("source-map"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fromBase64(str) {
  if (Buffer) {
    return Buffer.from(str, 'base64').toString();
  } else {
    return window.atob(str);
  }
}
/**
 * Source map information from input CSS.
 * For example, source map after Sass compiler.
 *
 * This class will automatically find source map in input CSS or in file system
 * near input file (according `from` option).
 *
 * @example
 * const root = postcss.parse(css, { from: 'a.sass.css' })
 * root.input.map //=> PreviousMap
 */


var PreviousMap =
/*#__PURE__*/
function () {
  /**
   * @param {string}         css    Input CSS source.
   * @param {processOptions} [opts] {@link Processor#process} options.
   */
  function PreviousMap(css, opts) {
    this.loadAnnotation(css);
    /**
     * Was source map inlined by data-uri to input CSS.
     *
     * @type {boolean}
     */

    this.inline = this.startWith(this.annotation, 'data:');
    var prev = opts.map ? opts.map.prev : undefined;
    var text = this.loadMap(opts.from, prev);
    if (text) this.text = text;
  }
  /**
   * Create a instance of `SourceMapGenerator` class
   * from the `source-map` library to work with source map information.
   *
   * It is lazy method, so it will create object only on first call
   * and then it will use cache.
   *
   * @return {SourceMapGenerator} Object with source map information.
   */


  var _proto = PreviousMap.prototype;

  _proto.consumer = function consumer() {
    if (!this.consumerCache) {
      this.consumerCache = new _sourceMap.default.SourceMapConsumer(this.text);
    }

    return this.consumerCache;
  };
  /**
   * Does source map contains `sourcesContent` with input source text.
   *
   * @return {boolean} Is `sourcesContent` present.
   */


  _proto.withContent = function withContent() {
    return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
  };

  _proto.startWith = function startWith(string, start) {
    if (!string) return false;
    return string.substr(0, start.length) === start;
  };

  _proto.loadAnnotation = function loadAnnotation(css) {
    var match = css.match(/\/\*\s*# sourceMappingURL=(.*)\s*\*\//);
    if (match) this.annotation = match[1].trim();
  };

  _proto.decodeInline = function decodeInline(text) {
    var baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
    var baseUri = /^data:application\/json;base64,/;
    var uri = 'data:application/json,';

    if (this.startWith(text, uri)) {
      return decodeURIComponent(text.substr(uri.length));
    }

    if (baseCharsetUri.test(text) || baseUri.test(text)) {
      return fromBase64(text.substr(RegExp.lastMatch.length));
    }

    var encoding = text.match(/data:application\/json;([^,]+),/)[1];
    throw new Error('Unsupported source map encoding ' + encoding);
  };

  _proto.loadMap = function loadMap(file, prev) {
    if (prev === false) return false;

    if (prev) {
      if (typeof prev === 'string') {
        return prev;
      } else if (typeof prev === 'function') {
        var prevPath = prev(file);

        if (prevPath && _fs.default.existsSync && _fs.default.existsSync(prevPath)) {
          return _fs.default.readFileSync(prevPath, 'utf-8').toString().trim();
        } else {
          throw new Error('Unable to load previous source map: ' + prevPath.toString());
        }
      } else if (prev instanceof _sourceMap.default.SourceMapConsumer) {
        return _sourceMap.default.SourceMapGenerator.fromSourceMap(prev).toString();
      } else if (prev instanceof _sourceMap.default.SourceMapGenerator) {
        return prev.toString();
      } else if (this.isMap(prev)) {
        return JSON.stringify(prev);
      } else {
        throw new Error('Unsupported previous source map format: ' + prev.toString());
      }
    } else if (this.inline) {
      return this.decodeInline(this.annotation);
    } else if (this.annotation) {
      var map = this.annotation;
      if (file) map = _path.default.join(_path.default.dirname(file), map);
      this.root = _path.default.dirname(map);

      if (_fs.default.existsSync && _fs.default.existsSync(map)) {
        return _fs.default.readFileSync(map, 'utf-8').toString().trim();
      } else {
        return false;
      }
    }
  };

  _proto.isMap = function isMap(map) {
    if (typeof map !== 'object') return false;
    return typeof map.mappings === 'string' || typeof map._mappings === 'string';
  };

  return PreviousMap;
}();

var _default = PreviousMap;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByZXZpb3VzLW1hcC5lczYiXSwibmFtZXMiOlsiZnJvbUJhc2U2NCIsInN0ciIsIkJ1ZmZlciIsImZyb20iLCJ0b1N0cmluZyIsIndpbmRvdyIsImF0b2IiLCJQcmV2aW91c01hcCIsImNzcyIsIm9wdHMiLCJsb2FkQW5ub3RhdGlvbiIsImlubGluZSIsInN0YXJ0V2l0aCIsImFubm90YXRpb24iLCJwcmV2IiwibWFwIiwidW5kZWZpbmVkIiwidGV4dCIsImxvYWRNYXAiLCJjb25zdW1lciIsImNvbnN1bWVyQ2FjaGUiLCJtb3ppbGxhIiwiU291cmNlTWFwQ29uc3VtZXIiLCJ3aXRoQ29udGVudCIsInNvdXJjZXNDb250ZW50IiwibGVuZ3RoIiwic3RyaW5nIiwic3RhcnQiLCJzdWJzdHIiLCJtYXRjaCIsInRyaW0iLCJkZWNvZGVJbmxpbmUiLCJiYXNlQ2hhcnNldFVyaSIsImJhc2VVcmkiLCJ1cmkiLCJkZWNvZGVVUklDb21wb25lbnQiLCJ0ZXN0IiwiUmVnRXhwIiwibGFzdE1hdGNoIiwiZW5jb2RpbmciLCJFcnJvciIsImZpbGUiLCJwcmV2UGF0aCIsImZzIiwiZXhpc3RzU3luYyIsInJlYWRGaWxlU3luYyIsIlNvdXJjZU1hcEdlbmVyYXRvciIsImZyb21Tb3VyY2VNYXAiLCJpc01hcCIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXRoIiwiam9pbiIsImRpcm5hbWUiLCJyb290IiwibWFwcGluZ3MiLCJfbWFwcGluZ3MiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxTQUFTQSxVQUFULENBQXFCQyxHQUFyQixFQUEwQjtBQUN4QixNQUFJQyxNQUFKLEVBQVk7QUFDVixXQUFPQSxNQUFNLENBQUNDLElBQVAsQ0FBWUYsR0FBWixFQUFpQixRQUFqQixFQUEyQkcsUUFBM0IsRUFBUDtBQUNELEdBRkQsTUFFTztBQUNMLFdBQU9DLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxHQUFaLENBQVA7QUFDRDtBQUNGO0FBRUQ7Ozs7Ozs7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Y0FBS0UsT0FBTCxDQUFhdEMsR0FBYixDQUFaOztBQUNBLFVBQUk0QixZQUFHQyxVQUFILElBQWlCRCxZQUFHQyxVQUFILENBQWM3QixHQUFkLENBQXJCLEVBQXlDO0FBQ3ZDLGVBQU80QixZQUFHRSxZQUFILENBQWdCOUIsR0FBaEIsRUFBcUIsT0FBckIsRUFBOEJYLFFBQTlCLEdBQXlDMEIsSUFBekMsRUFBUDtBQUNELE9BRkQsTUFFTztBQUNMLGVBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFDRixHOztTQUVEa0IsSyxrQkFBT2pDLEcsRUFBSztBQUNWLFFBQUksT0FBT0EsR0FBUCxLQUFlLFFBQW5CLEVBQTZCLE9BQU8sS0FBUDtBQUM3QixXQUFPLE9BQU9BLEdBQUcsQ0FBQ3dDLFFBQVgsS0FBd0IsUUFBeEIsSUFBb0MsT0FBT3hDLEdBQUcsQ0FBQ3lDLFNBQVgsS0FBeUIsUUFBcEU7QUFDRCxHOzs7OztlQUdZakQsVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb3ppbGxhIGZyb20gJ3NvdXJjZS1tYXAnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuXG5mdW5jdGlvbiBmcm9tQmFzZTY0IChzdHIpIHtcbiAgaWYgKEJ1ZmZlcikge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbShzdHIsICdiYXNlNjQnKS50b1N0cmluZygpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHdpbmRvdy5hdG9iKHN0cilcbiAgfVxufVxuXG4vKipcbiAqIFNvdXJjZSBtYXAgaW5mb3JtYXRpb24gZnJvbSBpbnB1dCBDU1MuXG4gKiBGb3IgZXhhbXBsZSwgc291cmNlIG1hcCBhZnRlciBTYXNzIGNvbXBpbGVyLlxuICpcbiAqIFRoaXMgY2xhc3Mgd2lsbCBhdXRvbWF0aWNhbGx5IGZpbmQgc291cmNlIG1hcCBpbiBpbnB1dCBDU1Mgb3IgaW4gZmlsZSBzeXN0ZW1cbiAqIG5lYXIgaW5wdXQgZmlsZSAoYWNjb3JkaW5nIGBmcm9tYCBvcHRpb24pLlxuICpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCByb290ID0gcG9zdGNzcy5wYXJzZShjc3MsIHsgZnJvbTogJ2Euc2Fzcy5jc3MnIH0pXG4gKiByb290LmlucHV0Lm1hcCAvLz0+IFByZXZpb3VzTWFwXG4gKi9cbmNsYXNzIFByZXZpb3VzTWFwIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgIGNzcyAgICBJbnB1dCBDU1Mgc291cmNlLlxuICAgKiBAcGFyYW0ge3Byb2Nlc3NPcHRpb25zfSBbb3B0c10ge0BsaW5rIFByb2Nlc3NvciNwcm9jZXNzfSBvcHRpb25zLlxuICAgKi9cbiAgY29uc3RydWN0b3IgKGNzcywgb3B0cykge1xuICAgIHRoaXMubG9hZEFubm90YXRpb24oY3NzKVxuICAgIC8qKlxuICAgICAqIFdhcyBzb3VyY2UgbWFwIGlubGluZWQgYnkgZGF0YS11cmkgdG8gaW5wdXQgQ1NTLlxuICAgICAqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pbmxpbmUgPSB0aGlzLnN0YXJ0V2l0aCh0aGlzLmFubm90YXRpb24sICdkYXRhOicpXG5cbiAgICBsZXQgcHJldiA9IG9wdHMubWFwID8gb3B0cy5tYXAucHJldiA6IHVuZGVmaW5lZFxuICAgIGxldCB0ZXh0ID0gdGhpcy5sb2FkTWFwKG9wdHMuZnJvbSwgcHJldilcbiAgICBpZiAodGV4dCkgdGhpcy50ZXh0ID0gdGV4dFxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGluc3RhbmNlIG9mIGBTb3VyY2VNYXBHZW5lcmF0b3JgIGNsYXNzXG4gICAqIGZyb20gdGhlIGBzb3VyY2UtbWFwYCBsaWJyYXJ5IHRvIHdvcmsgd2l0aCBzb3VyY2UgbWFwIGluZm9ybWF0aW9uLlxuICAgKlxuICAgKiBJdCBpcyBsYXp5IG1ldGhvZCwgc28gaXQgd2lsbCBjcmVhdGUgb2JqZWN0IG9ubHkgb24gZmlyc3QgY2FsbFxuICAgKiBhbmQgdGhlbiBpdCB3aWxsIHVzZSBjYWNoZS5cbiAgICpcbiAgICogQHJldHVybiB7U291cmNlTWFwR2VuZXJhdG9yfSBPYmplY3Qgd2l0aCBzb3VyY2UgbWFwIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgY29uc3VtZXIgKCkge1xuICAgIGlmICghdGhpcy5jb25zdW1lckNhY2hlKSB7XG4gICAgICB0aGlzLmNvbnN1bWVyQ2FjaGUgPSBuZXcgbW96aWxsYS5Tb3VyY2VNYXBDb25zdW1lcih0aGlzLnRleHQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbnN1bWVyQ2FjaGVcbiAgfVxuXG4gIC8qKlxuICAgKiBEb2VzIHNvdXJjZSBtYXAgY29udGFpbnMgYHNvdXJjZXNDb250ZW50YCB3aXRoIGlucHV0IHNvdXJjZSB0ZXh0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBJcyBgc291cmNlc0NvbnRlbnRgIHByZXNlbnQuXG4gICAqL1xuICB3aXRoQ29udGVudCAoKSB7XG4gICAgcmV0dXJuICEhKHRoaXMuY29uc3VtZXIoKS5zb3VyY2VzQ29udGVudCAmJlxuICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVyKCkuc291cmNlc0NvbnRlbnQubGVuZ3RoID4gMClcbiAgfVxuXG4gIHN0YXJ0V2l0aCAoc3RyaW5nLCBzdGFydCkge1xuICAgIGlmICghc3RyaW5nKSByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gc3RyaW5nLnN1YnN0cigwLCBzdGFydC5sZW5ndGgpID09PSBzdGFydFxuICB9XG5cbiAgbG9hZEFubm90YXRpb24gKGNzcykge1xuICAgIGxldCBtYXRjaCA9IGNzcy5tYXRjaCgvXFwvXFwqXFxzKiMgc291cmNlTWFwcGluZ1VSTD0oLiopXFxzKlxcKlxcLy8pXG4gICAgaWYgKG1hdGNoKSB0aGlzLmFubm90YXRpb24gPSBtYXRjaFsxXS50cmltKClcbiAgfVxuXG4gIGRlY29kZUlubGluZSAodGV4dCkge1xuICAgIGxldCBiYXNlQ2hhcnNldFVyaSA9IC9eZGF0YTphcHBsaWNhdGlvblxcL2pzb247Y2hhcnNldD11dGYtPzg7YmFzZTY0LC9cbiAgICBsZXQgYmFzZVVyaSA9IC9eZGF0YTphcHBsaWNhdGlvblxcL2pzb247YmFzZTY0LC9cbiAgICBsZXQgdXJpID0gJ2RhdGE6YXBwbGljYXRpb24vanNvbiwnXG5cbiAgICBpZiAodGhpcy5zdGFydFdpdGgodGV4dCwgdXJpKSkge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCh0ZXh0LnN1YnN0cih1cmkubGVuZ3RoKSlcbiAgICB9XG5cbiAgICBpZiAoYmFzZUNoYXJzZXRVcmkudGVzdCh0ZXh0KSB8fCBiYXNlVXJpLnRlc3QodGV4dCkpIHtcbiAgICAgIHJldHVybiBmcm9tQmFzZTY0KHRleHQuc3Vic3RyKFJlZ0V4cC5sYXN0TWF0Y2gubGVuZ3RoKSlcbiAgICB9XG5cbiAgICBsZXQgZW5jb2RpbmcgPSB0ZXh0Lm1hdGNoKC9kYXRhOmFwcGxpY2F0aW9uXFwvanNvbjsoW14sXSspLC8pWzFdXG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBzb3VyY2UgbWFwIGVuY29kaW5nICcgKyBlbmNvZGluZylcbiAgfVxuXG4gIGxvYWRNYXAgKGZpbGUsIHByZXYpIHtcbiAgICBpZiAocHJldiA9PT0gZmFsc2UpIHJldHVybiBmYWxzZVxuXG4gICAgaWYgKHByZXYpIHtcbiAgICAgIGlmICh0eXBlb2YgcHJldiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHByZXZcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByZXYgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbGV0IHByZXZQYXRoID0gcHJldihmaWxlKVxuICAgICAgICBpZiAocHJldlBhdGggJiYgZnMuZXhpc3RzU3luYyAmJiBmcy5leGlzdHNTeW5jKHByZXZQYXRoKSkge1xuICAgICAgICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocHJldlBhdGgsICd1dGYtOCcpLnRvU3RyaW5nKCkudHJpbSgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ1VuYWJsZSB0byBsb2FkIHByZXZpb3VzIHNvdXJjZSBtYXA6ICcgKyBwcmV2UGF0aC50b1N0cmluZygpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHByZXYgaW5zdGFuY2VvZiBtb3ppbGxhLlNvdXJjZU1hcENvbnN1bWVyKSB7XG4gICAgICAgIHJldHVybiBtb3ppbGxhLlNvdXJjZU1hcEdlbmVyYXRvci5mcm9tU291cmNlTWFwKHByZXYpLnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAocHJldiBpbnN0YW5jZW9mIG1vemlsbGEuU291cmNlTWFwR2VuZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBwcmV2LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc01hcChwcmV2KSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJldilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnVW5zdXBwb3J0ZWQgcHJldmlvdXMgc291cmNlIG1hcCBmb3JtYXQ6ICcgKyBwcmV2LnRvU3RyaW5nKCkpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmlubGluZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlSW5saW5lKHRoaXMuYW5ub3RhdGlvbilcbiAgICB9IGVsc2UgaWYgKHRoaXMuYW5ub3RhdGlvbikge1xuICAgICAgbGV0IG1hcCA9IHRoaXMuYW5ub3RhdGlvblxuICAgICAgaWYgKGZpbGUpIG1hcCA9IHBhdGguam9pbihwYXRoLmRpcm5hbWUoZmlsZSksIG1hcClcblxuICAgICAgdGhpcy5yb290ID0gcGF0aC5kaXJuYW1lKG1hcClcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jICYmIGZzLmV4aXN0c1N5bmMobWFwKSkge1xuICAgICAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKG1hcCwgJ3V0Zi04JykudG9TdHJpbmcoKS50cmltKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzTWFwIChtYXApIHtcbiAgICBpZiAodHlwZW9mIG1hcCAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0eXBlb2YgbWFwLm1hcHBpbmdzID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgbWFwLl9tYXBwaW5ncyA9PT0gJ3N0cmluZydcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmV2aW91c01hcFxuIl0sImZpbGUiOiJwcmV2aW91cy1tYXAuanMifQ==
