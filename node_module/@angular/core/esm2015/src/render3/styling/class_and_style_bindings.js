/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { RendererStyleFlags3, isProceduralRenderer } from '../interfaces/renderer';
import { getRootContext } from '../util';
import { BoundPlayerFactory } from './player_factory';
import { addPlayerInternal, allocPlayerContext, createEmptyStylingContext, getPlayerContext } from './util';
/** @type {?} */
const EMPTY_ARR = [];
/** @type {?} */
const EMPTY_OBJ = {};
/**
 * Creates a styling context template where styling information is stored.
 * Any styles that are later referenced using `updateStyleProp` must be
 * passed in within this function. Initial values for those styles are to
 * be declared after all initial style properties are declared (this change in
 * mode between declarations and initial styles is made possible using a special
 * enum value found in `definition.ts`).
 *
 * @param {?=} initialClassDeclarations a list of class declarations and initial class values
 *    that are used later within the styling context.
 *
 *    -> ['foo', 'bar', SPECIAL_ENUM_VAL, 'foo', true]
 *       This implies that `foo` and `bar` will be later styled and that the `foo`
 *       class will be applied to the element as an initial class since it's true
 * @param {?=} initialStyleDeclarations a list of style declarations and initial style values
 *    that are used later within the styling context.
 *
 *    -> ['width', 'height', SPECIAL_ENUM_VAL, 'width', '100px']
 *       This implies that `width` and `height` will be later styled and that the `width`
 *       property has an initial value of `100px`.
 *
 * @param {?=} styleSanitizer
 * @return {?}
 */
export function createStylingContextTemplate(initialClassDeclarations, initialStyleDeclarations, styleSanitizer) {
    /** @type {?} */
    const initialStylingValues = [null];
    /** @type {?} */
    const context = createEmptyStylingContext(null, styleSanitizer, initialStylingValues);
    /** @type {?} */
    const stylesLookup = {};
    /** @type {?} */
    const classesLookup = {};
    /** @type {?} */
    let totalStyleDeclarations = 0;
    if (initialStyleDeclarations) {
        /** @type {?} */
        let hasPassedDeclarations = false;
        for (let i = 0; i < initialStyleDeclarations.length; i++) {
            /** @type {?} */
            const v = /** @type {?} */ (initialStyleDeclarations[i]);
            // this flag value marks where the declarations end the initial values begin
            if (v === 1 /* VALUES_MODE */) {
                hasPassedDeclarations = true;
            }
            else {
                /** @type {?} */
                const prop = /** @type {?} */ (v);
                if (hasPassedDeclarations) {
                    /** @type {?} */
                    const value = /** @type {?} */ (initialStyleDeclarations[++i]);
                    initialStylingValues.push(value);
                    stylesLookup[prop] = initialStylingValues.length - 1;
                }
                else {
                    totalStyleDeclarations++;
                    stylesLookup[prop] = 0;
                }
            }
        }
    }
    // make where the class offsets begin
    context[4 /* ClassOffsetPosition */] = totalStyleDeclarations;
    if (initialClassDeclarations) {
        /** @type {?} */
        let hasPassedDeclarations = false;
        for (let i = 0; i < initialClassDeclarations.length; i++) {
            /** @type {?} */
            const v = /** @type {?} */ (initialClassDeclarations[i]);
            // this flag value marks where the declarations end the initial values begin
            if (v === 1 /* VALUES_MODE */) {
                hasPassedDeclarations = true;
            }
            else {
                /** @type {?} */
                const className = /** @type {?} */ (v);
                if (hasPassedDeclarations) {
                    /** @type {?} */
                    const value = /** @type {?} */ (initialClassDeclarations[++i]);
                    initialStylingValues.push(value);
                    classesLookup[className] = initialStylingValues.length - 1;
                }
                else {
                    classesLookup[className] = 0;
                }
            }
        }
    }
    /** @type {?} */
    const styleProps = Object.keys(stylesLookup);
    /** @type {?} */
    const classNames = Object.keys(classesLookup);
    /** @type {?} */
    const classNamesIndexStart = styleProps.length;
    /** @type {?} */
    const totalProps = styleProps.length + classNames.length;
    /** @type {?} */
    const maxLength = totalProps * 4 /* Size */ * 2 + 8 /* SingleStylesStartPosition */;
    // we need to fill the array from the start so that we can access
    // both the multi and the single array positions in the same loop block
    for (let i = 8 /* SingleStylesStartPosition */; i < maxLength; i++) {
        context.push(null);
    }
    /** @type {?} */
    const singleStart = 8 /* SingleStylesStartPosition */;
    /** @type {?} */
    const multiStart = totalProps * 4 /* Size */ + 8 /* SingleStylesStartPosition */;
    // fill single and multi-level styles
    for (let i = 0; i < totalProps; i++) {
        /** @type {?} */
        const isClassBased = i >= classNamesIndexStart;
        /** @type {?} */
        const prop = isClassBased ? classNames[i - classNamesIndexStart] : styleProps[i];
        /** @type {?} */
        const indexForInitial = isClassBased ? classesLookup[prop] : stylesLookup[prop];
        /** @type {?} */
        const initialValue = initialStylingValues[indexForInitial];
        /** @type {?} */
        const indexForMulti = i * 4 /* Size */ + multiStart;
        /** @type {?} */
        const indexForSingle = i * 4 /* Size */ + singleStart;
        /** @type {?} */
        const initialFlag = prepareInitialFlag(prop, isClassBased, styleSanitizer || null);
        setFlag(context, indexForSingle, pointers(initialFlag, indexForInitial, indexForMulti));
        setProp(context, indexForSingle, prop);
        setValue(context, indexForSingle, null);
        setPlayerBuilderIndex(context, indexForSingle, 0);
        /** @type {?} */
        const flagForMulti = initialFlag | (initialValue !== null ? 1 /* Dirty */ : 0 /* None */);
        setFlag(context, indexForMulti, pointers(flagForMulti, indexForInitial, indexForSingle));
        setProp(context, indexForMulti, prop);
        setValue(context, indexForMulti, null);
        setPlayerBuilderIndex(context, indexForMulti, 0);
    }
    // there is no initial value flag for the master index since it doesn't
    // reference an initial style value
    setFlag(context, 3 /* MasterFlagPosition */, pointers(0, 0, multiStart));
    setContextDirty(context, initialStylingValues.length > 1);
    return context;
}
/**
 * Sets and resolves all `multi` styling on an `StylingContext` so that they can be
 * applied to the element once `renderStyleAndClassBindings` is called.
 *
 * All missing styles/class (any values that are not provided in the new `styles`
 * or `classes` params) will resolve to `null` within their respective positions
 * in the context.
 *
 * @param {?} context The styling context that will be updated with the
 *    newly provided style values.
 * @param {?} classesInput The key/value map of CSS class names that will be used for the update.
 * @param {?=} stylesInput The key/value map of CSS styles that will be used for the update.
 * @return {?}
 */
export function updateStylingMap(context, classesInput, stylesInput) {
    stylesInput = stylesInput || null;
    /** @type {?} */
    const element = /** @type {?} */ (((context[5 /* ElementPosition */])));
    /** @type {?} */
    const classesPlayerBuilder = classesInput instanceof BoundPlayerFactory ?
        new ClassAndStylePlayerBuilder(/** @type {?} */ (classesInput), element, 2 /* Class */) :
        null;
    /** @type {?} */
    const stylesPlayerBuilder = stylesInput instanceof BoundPlayerFactory ?
        new ClassAndStylePlayerBuilder(/** @type {?} */ (stylesInput), element, 3 /* Style */) :
        null;
    /** @type {?} */
    const classesValue = classesPlayerBuilder ? /** @type {?} */ (((/** @type {?} */ (classesInput)))).value :
        classesInput;
    /** @type {?} */
    const stylesValue = stylesPlayerBuilder ? stylesInput["value"] : stylesInput;
    /** @type {?} */
    const ignoreAllClassUpdates = classesValue === context[6 /* PreviousMultiClassValue */];
    /** @type {?} */
    const ignoreAllStyleUpdates = stylesValue === context[7 /* PreviousMultiStyleValue */];
    if (ignoreAllClassUpdates && ignoreAllStyleUpdates)
        return;
    context[6 /* PreviousMultiClassValue */] = classesValue;
    context[7 /* PreviousMultiStyleValue */] = stylesValue;
    /** @type {?} */
    let classNames = EMPTY_ARR;
    /** @type {?} */
    let applyAllClasses = false;
    /** @type {?} */
    let playerBuildersAreDirty = false;
    /** @type {?} */
    const classesPlayerBuilderIndex = classesPlayerBuilder ? 1 /* ClassMapPlayerBuilderPosition */ : 0;
    if (hasPlayerBuilderChanged(context, classesPlayerBuilder, 1 /* ClassMapPlayerBuilderPosition */)) {
        setPlayerBuilder(context, classesPlayerBuilder, 1 /* ClassMapPlayerBuilderPosition */);
        playerBuildersAreDirty = true;
    }
    /** @type {?} */
    const stylesPlayerBuilderIndex = stylesPlayerBuilder ? 3 /* StyleMapPlayerBuilderPosition */ : 0;
    if (hasPlayerBuilderChanged(context, stylesPlayerBuilder, 3 /* StyleMapPlayerBuilderPosition */)) {
        setPlayerBuilder(context, stylesPlayerBuilder, 3 /* StyleMapPlayerBuilderPosition */);
        playerBuildersAreDirty = true;
    }
    // each time a string-based value pops up then it shouldn't require a deep
    // check of what's changed.
    if (!ignoreAllClassUpdates) {
        if (typeof classesValue == 'string') {
            classNames = classesValue.split(/\s+/);
            // this boolean is used to avoid having to create a key/value map of `true` values
            // since a classname string implies that all those classes are added
            applyAllClasses = true;
        }
        else {
            classNames = classesValue ? Object.keys(classesValue) : EMPTY_ARR;
        }
    }
    /** @type {?} */
    const classes = /** @type {?} */ ((classesValue || EMPTY_OBJ));
    /** @type {?} */
    const styleProps = stylesValue ? Object.keys(stylesValue) : EMPTY_ARR;
    /** @type {?} */
    const styles = stylesValue || EMPTY_OBJ;
    /** @type {?} */
    const classesStartIndex = styleProps.length;
    /** @type {?} */
    const multiStartIndex = getMultiStartIndex(context);
    /** @type {?} */
    let dirty = false;
    /** @type {?} */
    let ctxIndex = multiStartIndex;
    /** @type {?} */
    let propIndex = 0;
    /** @type {?} */
    const propLimit = styleProps.length + classNames.length;
    // the main loop here will try and figure out how the shape of the provided
    // styles differ with respect to the context. Later if the context/styles/classes
    // are off-balance then they will be dealt in another loop after this one
    while (ctxIndex < context.length && propIndex < propLimit) {
        /** @type {?} */
        const isClassBased = propIndex >= classesStartIndex;
        /** @type {?} */
        const processValue = (!isClassBased && !ignoreAllStyleUpdates) || (isClassBased && !ignoreAllClassUpdates);
        // when there is a cache-hit for a string-based class then we should
        // avoid doing any work diffing any of the changes
        if (processValue) {
            /** @type {?} */
            const adjustedPropIndex = isClassBased ? propIndex - classesStartIndex : propIndex;
            /** @type {?} */
            const newProp = isClassBased ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
            /** @type {?} */
            const newValue = isClassBased ? (applyAllClasses ? true : classes[newProp]) : styles[newProp];
            /** @type {?} */
            const playerBuilderIndex = isClassBased ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
            /** @type {?} */
            const prop = getProp(context, ctxIndex);
            if (prop === newProp) {
                /** @type {?} */
                const value = getValue(context, ctxIndex);
                /** @type {?} */
                const flag = getPointers(context, ctxIndex);
                setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex);
                if (hasValueChanged(flag, value, newValue)) {
                    setValue(context, ctxIndex, newValue);
                    playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
                    /** @type {?} */
                    const initialValue = getInitialValue(context, flag);
                    // there is no point in setting this to dirty if the previously
                    // rendered value was being referenced by the initial style (or null)
                    if (hasValueChanged(flag, initialValue, newValue)) {
                        setDirty(context, ctxIndex, true);
                        dirty = true;
                    }
                }
            }
            else {
                /** @type {?} */
                const indexOfEntry = findEntryPositionByProp(context, newProp, ctxIndex);
                if (indexOfEntry > 0) {
                    /** @type {?} */
                    const valueToCompare = getValue(context, indexOfEntry);
                    /** @type {?} */
                    const flagToCompare = getPointers(context, indexOfEntry);
                    swapMultiContextEntries(context, ctxIndex, indexOfEntry);
                    if (hasValueChanged(flagToCompare, valueToCompare, newValue)) {
                        /** @type {?} */
                        const initialValue = getInitialValue(context, flagToCompare);
                        setValue(context, ctxIndex, newValue);
                        if (hasValueChanged(flagToCompare, initialValue, newValue)) {
                            setDirty(context, ctxIndex, true);
                            playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
                            dirty = true;
                        }
                    }
                }
                else {
                    /** @type {?} */
                    const newFlag = prepareInitialFlag(newProp, isClassBased, getStyleSanitizer(context));
                    playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
                    insertNewMultiProperty(context, ctxIndex, isClassBased, newProp, newFlag, newValue, playerBuilderIndex);
                    dirty = true;
                }
            }
        }
        ctxIndex += 4 /* Size */;
        propIndex++;
    }
    // this means that there are left-over values in the context that
    // were not included in the provided styles/classes and in this
    // case the  goal is to "remove" them from the context (by nullifying)
    while (ctxIndex < context.length) {
        /** @type {?} */
        const flag = getPointers(context, ctxIndex);
        /** @type {?} */
        const isClassBased = (flag & 2 /* Class */) === 2 /* Class */;
        /** @type {?} */
        const processValue = (!isClassBased && !ignoreAllStyleUpdates) || (isClassBased && !ignoreAllClassUpdates);
        if (processValue) {
            /** @type {?} */
            const value = getValue(context, ctxIndex);
            /** @type {?} */
            const doRemoveValue = valueExists(value, isClassBased);
            if (doRemoveValue) {
                setDirty(context, ctxIndex, true);
                setValue(context, ctxIndex, null);
                /** @type {?} */
                const playerBuilderIndex = isClassBased ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
                setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex);
                dirty = true;
            }
        }
        ctxIndex += 4 /* Size */;
    }
    /** @type {?} */
    const sanitizer = getStyleSanitizer(context);
    while (propIndex < propLimit) {
        /** @type {?} */
        const isClassBased = propIndex >= classesStartIndex;
        /** @type {?} */
        const processValue = (!isClassBased && !ignoreAllStyleUpdates) || (isClassBased && !ignoreAllClassUpdates);
        if (processValue) {
            /** @type {?} */
            const adjustedPropIndex = isClassBased ? propIndex - classesStartIndex : propIndex;
            /** @type {?} */
            const prop = isClassBased ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
            /** @type {?} */
            const value = isClassBased ? (applyAllClasses ? true : classes[prop]) : styles[prop];
            /** @type {?} */
            const flag = prepareInitialFlag(prop, isClassBased, sanitizer) | 1 /* Dirty */;
            /** @type {?} */
            const playerBuilderIndex = isClassBased ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
            context.push(flag, prop, value, playerBuilderIndex);
            dirty = true;
        }
        propIndex++;
    }
    if (dirty) {
        setContextDirty(context, true);
    }
    if (playerBuildersAreDirty) {
        setContextPlayersDirty(context, true);
    }
}
/**
 * Sets and resolves a single styling property/value on the provided `StylingContext` so
 * that they can be applied to the element once `renderStyleAndClassBindings` is called.
 *
 * Note that prop-level styling values are considered higher priority than any styling that
 * has been applied using `updateStylingMap`, therefore, when styling values are rendered
 * then any styles/classes that have been applied using this function will be considered first
 * (then multi values second and then initial values as a backup).
 *
 * @param {?} context The styling context that will be updated with the
 *    newly provided style value.
 * @param {?} index The index of the property which is being updated.
 * @param {?} input
 * @return {?}
 */
export function updateStyleProp(context, index, input) {
    /** @type {?} */
    const singleIndex = 8 /* SingleStylesStartPosition */ + index * 4 /* Size */;
    /** @type {?} */
    const currValue = getValue(context, singleIndex);
    /** @type {?} */
    const currFlag = getPointers(context, singleIndex);
    /** @type {?} */
    const value = (input instanceof BoundPlayerFactory) ? input.value : input;
    // didn't change ... nothing to make a note of
    if (hasValueChanged(currFlag, currValue, value)) {
        /** @type {?} */
        const isClassBased = (currFlag & 2 /* Class */) === 2 /* Class */;
        /** @type {?} */
        const element = /** @type {?} */ (((context[5 /* ElementPosition */])));
        /** @type {?} */
        const playerBuilder = input instanceof BoundPlayerFactory ?
            new ClassAndStylePlayerBuilder(/** @type {?} */ (input), element, isClassBased ? 2 /* Class */ : 3 /* Style */) :
            null;
        /** @type {?} */
        const value = /** @type {?} */ ((playerBuilder ? (/** @type {?} */ (input)).value : input));
        /** @type {?} */
        const currPlayerIndex = getPlayerBuilderIndex(context, singleIndex);
        /** @type {?} */
        let playerBuildersAreDirty = false;
        /** @type {?} */
        let playerBuilderIndex = playerBuilder ? currPlayerIndex : 0;
        if (hasPlayerBuilderChanged(context, playerBuilder, currPlayerIndex)) {
            /** @type {?} */
            const newIndex = setPlayerBuilder(context, playerBuilder, currPlayerIndex);
            playerBuilderIndex = playerBuilder ? newIndex : 0;
            setPlayerBuilderIndex(context, singleIndex, playerBuilderIndex);
            playerBuildersAreDirty = true;
        }
        // the value will always get updated (even if the dirty flag is skipped)
        setValue(context, singleIndex, value);
        /** @type {?} */
        const indexForMulti = getMultiOrSingleIndex(currFlag);
        /** @type {?} */
        const valueForMulti = getValue(context, indexForMulti);
        if (!valueForMulti || hasValueChanged(currFlag, valueForMulti, value)) {
            /** @type {?} */
            let multiDirty = false;
            /** @type {?} */
            let singleDirty = true;
            // only when the value is set to `null` should the multi-value get flagged
            if (!valueExists(value, isClassBased) && valueExists(valueForMulti, isClassBased)) {
                multiDirty = true;
                singleDirty = false;
            }
            setDirty(context, indexForMulti, multiDirty);
            setDirty(context, singleIndex, singleDirty);
            setContextDirty(context, true);
        }
        if (playerBuildersAreDirty) {
            setContextPlayersDirty(context, true);
        }
    }
}
/**
 * This method will toggle the referenced CSS class (by the provided index)
 * within the given context.
 *
 * @param {?} context The styling context that will be updated with the
 *    newly provided class value.
 * @param {?} index The index of the CSS class which is being updated.
 * @param {?} addOrRemove Whether or not to add or remove the CSS class
 * @return {?}
 */
export function updateClassProp(context, index, addOrRemove) {
    /** @type {?} */
    const adjustedIndex = index + context[4 /* ClassOffsetPosition */];
    updateStyleProp(context, adjustedIndex, addOrRemove);
}
/**
 * Renders all queued styling using a renderer onto the given element.
 *
 * This function works by rendering any styles (that have been applied
 * using `updateStylingMap`) and any classes (that have been applied using
 * `updateStyleProp`) onto the provided element using the provided renderer.
 * Just before the styles/classes are rendered a final key/value style map
 * will be assembled (if `styleStore` or `classStore` are provided).
 *
 * @param {?} context The styling context that will be used to determine
 *      what styles will be rendered
 * @param {?} renderer the renderer that will be used to apply the styling
 * @param {?} rootOrView
 * @param {?=} classesStore if provided, the updated class values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param {?=} stylesStore if provided, the updated style values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @return {?} number the total amount of players that got queued for animation (if any)
 */
export function renderStyleAndClassBindings(context, renderer, rootOrView, classesStore, stylesStore) {
    /** @type {?} */
    let totalPlayersQueued = 0;
    if (isContextDirty(context)) {
        /** @type {?} */
        const flushPlayerBuilders = context[3 /* MasterFlagPosition */] & 8 /* PlayerBuildersDirty */;
        /** @type {?} */
        const native = /** @type {?} */ ((context[5 /* ElementPosition */]));
        /** @type {?} */
        const multiStartIndex = getMultiStartIndex(context);
        /** @type {?} */
        const styleSanitizer = getStyleSanitizer(context);
        for (let i = 8 /* SingleStylesStartPosition */; i < context.length; i += 4 /* Size */) {
            // there is no point in rendering styles that have not changed on screen
            if (isDirty(context, i)) {
                /** @type {?} */
                const prop = getProp(context, i);
                /** @type {?} */
                const value = getValue(context, i);
                /** @type {?} */
                const flag = getPointers(context, i);
                /** @type {?} */
                const playerBuilder = getPlayerBuilder(context, i);
                /** @type {?} */
                const isClassBased = flag & 2 /* Class */ ? true : false;
                /** @type {?} */
                const isInSingleRegion = i < multiStartIndex;
                /** @type {?} */
                let valueToApply = value;
                // VALUE DEFER CASE 1: Use a multi value instead of a null single value
                // this check implies that a single value was removed and we
                // should now defer to a multi value and use that (if set).
                if (isInSingleRegion && !valueExists(valueToApply, isClassBased)) {
                    /** @type {?} */
                    const multiIndex = getMultiOrSingleIndex(flag);
                    valueToApply = getValue(context, multiIndex);
                }
                // VALUE DEFER CASE 2: Use the initial value if all else fails (is falsy)
                // the initial value will always be a string or null,
                // therefore we can safely adopt it incase there's nothing else
                // note that this should always be a falsy check since `false` is used
                // for both class and style comparisons (styles can't be false and false
                // classes are turned off and should therefore defer to their initial values)
                if (!valueExists(valueToApply, isClassBased)) {
                    valueToApply = getInitialValue(context, flag);
                }
                if (isClassBased) {
                    setClass(native, prop, valueToApply ? true : false, renderer, classesStore, playerBuilder);
                }
                else {
                    /** @type {?} */
                    const sanitizer = (flag & 4 /* Sanitize */) ? styleSanitizer : null;
                    setStyle(native, prop, /** @type {?} */ (valueToApply), renderer, sanitizer, stylesStore, playerBuilder);
                }
                setDirty(context, i, false);
            }
        }
        if (flushPlayerBuilders) {
            /** @type {?} */
            const rootContext = Array.isArray(rootOrView) ? getRootContext(rootOrView) : /** @type {?} */ (rootOrView);
            /** @type {?} */
            const playerContext = /** @type {?} */ ((getPlayerContext(context)));
            /** @type {?} */
            const playersStartIndex = playerContext[0 /* NonBuilderPlayersStart */];
            for (let i = 1 /* PlayerBuildersStartPosition */; i < playersStartIndex; i += 2 /* PlayerAndPlayerBuildersTupleSize */) {
                /** @type {?} */
                const builder = /** @type {?} */ (playerContext[i]);
                /** @type {?} */
                const playerInsertionIndex = i + 1 /* PlayerOffsetPosition */;
                /** @type {?} */
                const oldPlayer = /** @type {?} */ (playerContext[playerInsertionIndex]);
                if (builder) {
                    /** @type {?} */
                    const player = builder.buildPlayer(oldPlayer);
                    if (player !== undefined) {
                        if (player != null) {
                            /** @type {?} */
                            const wasQueued = addPlayerInternal(playerContext, rootContext, /** @type {?} */ (native), player, playerInsertionIndex);
                            wasQueued && totalPlayersQueued++;
                        }
                        if (oldPlayer) {
                            oldPlayer.destroy();
                        }
                    }
                }
                else if (oldPlayer) {
                    // the player builder has been removed ... therefore we should delete the associated
                    // player
                    oldPlayer.destroy();
                }
            }
            setContextPlayersDirty(context, false);
        }
        setContextDirty(context, false);
    }
    return totalPlayersQueued;
}
/**
 * This function renders a given CSS prop/value entry using the
 * provided renderer. If a `store` value is provided then
 * that will be used a render context instead of the provided
 * renderer.
 *
 * @param {?} native the DOM Element
 * @param {?} prop the CSS style property that will be rendered
 * @param {?} value the CSS style value that will be rendered
 * @param {?} renderer
 * @param {?} sanitizer
 * @param {?=} store an optional key/value map that will be used as a context to render styles on
 * @param {?=} playerBuilder
 * @return {?}
 */
function setStyle(native, prop, value, renderer, sanitizer, store, playerBuilder) {
    value = sanitizer && value ? sanitizer(prop, value) : value;
    if (store || playerBuilder) {
        if (store) {
            store.setValue(prop, value);
        }
        if (playerBuilder) {
            playerBuilder.setValue(prop, value);
        }
    }
    else if (value) {
        ngDevMode && ngDevMode.rendererSetStyle++;
        isProceduralRenderer(renderer) ?
            renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase) :
            native['style'].setProperty(prop, value);
    }
    else {
        ngDevMode && ngDevMode.rendererRemoveStyle++;
        isProceduralRenderer(renderer) ?
            renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase) :
            native['style'].removeProperty(prop);
    }
}
/**
 * This function renders a given CSS class value using the provided
 * renderer (by adding or removing it from the provided element).
 * If a `store` value is provided then that will be used a render
 * context instead of the provided renderer.
 *
 * @param {?} native the DOM Element
 * @param {?} className
 * @param {?} add
 * @param {?} renderer
 * @param {?=} store an optional key/value map that will be used as a context to render styles on
 * @param {?=} playerBuilder
 * @return {?}
 */
function setClass(native, className, add, renderer, store, playerBuilder) {
    if (store || playerBuilder) {
        if (store) {
            store.setValue(className, add);
        }
        if (playerBuilder) {
            playerBuilder.setValue(className, add);
        }
    }
    else if (add) {
        ngDevMode && ngDevMode.rendererAddClass++;
        isProceduralRenderer(renderer) ? renderer.addClass(native, className) :
            native['classList'].add(className);
    }
    else {
        ngDevMode && ngDevMode.rendererRemoveClass++;
        isProceduralRenderer(renderer) ? renderer.removeClass(native, className) :
            native['classList'].remove(className);
    }
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} isDirtyYes
 * @return {?}
 */
function setDirty(context, index, isDirtyYes) {
    /** @type {?} */
    const adjustedIndex = index >= 8 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    if (isDirtyYes) {
        (/** @type {?} */ (context[adjustedIndex])) |= 1 /* Dirty */;
    }
    else {
        (/** @type {?} */ (context[adjustedIndex])) &= ~1 /* Dirty */;
    }
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function isDirty(context, index) {
    /** @type {?} */
    const adjustedIndex = index >= 8 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    return ((/** @type {?} */ (context[adjustedIndex])) & 1 /* Dirty */) == 1 /* Dirty */;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function isClassBased(context, index) {
    /** @type {?} */
    const adjustedIndex = index >= 8 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    return ((/** @type {?} */ (context[adjustedIndex])) & 2 /* Class */) == 2 /* Class */;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function isSanitizable(context, index) {
    /** @type {?} */
    const adjustedIndex = index >= 8 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    return ((/** @type {?} */ (context[adjustedIndex])) & 4 /* Sanitize */) == 4 /* Sanitize */;
}
/**
 * @param {?} configFlag
 * @param {?} staticIndex
 * @param {?} dynamicIndex
 * @return {?}
 */
function pointers(configFlag, staticIndex, dynamicIndex) {
    return (configFlag & 15 /* BitMask */) | (staticIndex << 4 /* BitCountSize */) |
        (dynamicIndex << (14 /* BitCountSize */ + 4 /* BitCountSize */));
}
/**
 * @param {?} context
 * @param {?} flag
 * @return {?}
 */
function getInitialValue(context, flag) {
    /** @type {?} */
    const index = getInitialIndex(flag);
    return /** @type {?} */ (context[2 /* InitialStylesPosition */][index]);
}
/**
 * @param {?} flag
 * @return {?}
 */
function getInitialIndex(flag) {
    return (flag >> 4 /* BitCountSize */) & 16383 /* BitMask */;
}
/**
 * @param {?} flag
 * @return {?}
 */
function getMultiOrSingleIndex(flag) {
    /** @type {?} */
    const index = (flag >> (14 /* BitCountSize */ + 4 /* BitCountSize */)) & 16383 /* BitMask */;
    return index >= 8 /* SingleStylesStartPosition */ ? index : -1;
}
/**
 * @param {?} context
 * @return {?}
 */
function getMultiStartIndex(context) {
    return /** @type {?} */ (getMultiOrSingleIndex(context[3 /* MasterFlagPosition */]));
}
/**
 * @param {?} context
 * @return {?}
 */
function getStyleSanitizer(context) {
    return context[1 /* StyleSanitizerPosition */];
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} prop
 * @return {?}
 */
function setProp(context, index, prop) {
    context[index + 1 /* PropertyOffset */] = prop;
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} value
 * @return {?}
 */
function setValue(context, index, value) {
    context[index + 2 /* ValueOffset */] = value;
}
/**
 * @param {?} context
 * @param {?} builder
 * @param {?} index
 * @return {?}
 */
function hasPlayerBuilderChanged(context, builder, index) {
    /** @type {?} */
    const playerContext = /** @type {?} */ ((context[0 /* PlayerContext */]));
    if (builder) {
        if (!playerContext || index === 0) {
            return true;
        }
    }
    else if (!playerContext) {
        return false;
    }
    return playerContext[index] !== builder;
}
/**
 * @param {?} context
 * @param {?} builder
 * @param {?} insertionIndex
 * @return {?}
 */
function setPlayerBuilder(context, builder, insertionIndex) {
    /** @type {?} */
    let playerContext = context[0 /* PlayerContext */] || allocPlayerContext(context);
    if (insertionIndex > 0) {
        playerContext[insertionIndex] = builder;
    }
    else {
        insertionIndex = playerContext[0 /* NonBuilderPlayersStart */];
        playerContext.splice(insertionIndex, 0, builder, null);
        playerContext[0 /* NonBuilderPlayersStart */] +=
            2 /* PlayerAndPlayerBuildersTupleSize */;
    }
    return insertionIndex;
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} playerBuilderIndex
 * @return {?}
 */
function setPlayerBuilderIndex(context, index, playerBuilderIndex) {
    context[index + 3 /* PlayerBuilderIndexOffset */] = playerBuilderIndex;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function getPlayerBuilderIndex(context, index) {
    return (/** @type {?} */ (context[index + 3 /* PlayerBuilderIndexOffset */])) || 0;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function getPlayerBuilder(context, index) {
    /** @type {?} */
    const playerBuilderIndex = getPlayerBuilderIndex(context, index);
    if (playerBuilderIndex) {
        /** @type {?} */
        const playerContext = context[0 /* PlayerContext */];
        if (playerContext) {
            return /** @type {?} */ (playerContext[playerBuilderIndex]);
        }
    }
    return null;
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} flag
 * @return {?}
 */
function setFlag(context, index, flag) {
    /** @type {?} */
    const adjustedIndex = index === 3 /* MasterFlagPosition */ ? index : (index + 0 /* FlagsOffset */);
    context[adjustedIndex] = flag;
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function getPointers(context, index) {
    /** @type {?} */
    const adjustedIndex = index === 3 /* MasterFlagPosition */ ? index : (index + 0 /* FlagsOffset */);
    return /** @type {?} */ (context[adjustedIndex]);
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function getValue(context, index) {
    return /** @type {?} */ (context[index + 2 /* ValueOffset */]);
}
/**
 * @param {?} context
 * @param {?} index
 * @return {?}
 */
function getProp(context, index) {
    return /** @type {?} */ (context[index + 1 /* PropertyOffset */]);
}
/**
 * @param {?} context
 * @return {?}
 */
export function isContextDirty(context) {
    return isDirty(context, 3 /* MasterFlagPosition */);
}
/**
 * @param {?} context
 * @param {?} isDirtyYes
 * @return {?}
 */
export function setContextDirty(context, isDirtyYes) {
    setDirty(context, 3 /* MasterFlagPosition */, isDirtyYes);
}
/**
 * @param {?} context
 * @param {?} isDirtyYes
 * @return {?}
 */
export function setContextPlayersDirty(context, isDirtyYes) {
    if (isDirtyYes) {
        (/** @type {?} */ (context[3 /* MasterFlagPosition */])) |= 8 /* PlayerBuildersDirty */;
    }
    else {
        (/** @type {?} */ (context[3 /* MasterFlagPosition */])) &= ~8 /* PlayerBuildersDirty */;
    }
}
/**
 * @param {?} context
 * @param {?} prop
 * @param {?=} startIndex
 * @return {?}
 */
function findEntryPositionByProp(context, prop, startIndex) {
    for (let i = (startIndex || 0) + 1 /* PropertyOffset */; i < context.length; i += 4 /* Size */) {
        /** @type {?} */
        const thisProp = context[i];
        if (thisProp == prop) {
            return i - 1 /* PropertyOffset */;
        }
    }
    return -1;
}
/**
 * @param {?} context
 * @param {?} indexA
 * @param {?} indexB
 * @return {?}
 */
function swapMultiContextEntries(context, indexA, indexB) {
    /** @type {?} */
    const tmpValue = getValue(context, indexA);
    /** @type {?} */
    const tmpProp = getProp(context, indexA);
    /** @type {?} */
    const tmpFlag = getPointers(context, indexA);
    /** @type {?} */
    const tmpPlayerBuilderIndex = getPlayerBuilderIndex(context, indexA);
    /** @type {?} */
    let flagA = tmpFlag;
    /** @type {?} */
    let flagB = getPointers(context, indexB);
    /** @type {?} */
    const singleIndexA = getMultiOrSingleIndex(flagA);
    if (singleIndexA >= 0) {
        /** @type {?} */
        const _flag = getPointers(context, singleIndexA);
        /** @type {?} */
        const _initial = getInitialIndex(_flag);
        setFlag(context, singleIndexA, pointers(_flag, _initial, indexB));
    }
    /** @type {?} */
    const singleIndexB = getMultiOrSingleIndex(flagB);
    if (singleIndexB >= 0) {
        /** @type {?} */
        const _flag = getPointers(context, singleIndexB);
        /** @type {?} */
        const _initial = getInitialIndex(_flag);
        setFlag(context, singleIndexB, pointers(_flag, _initial, indexA));
    }
    setValue(context, indexA, getValue(context, indexB));
    setProp(context, indexA, getProp(context, indexB));
    setFlag(context, indexA, getPointers(context, indexB));
    setPlayerBuilderIndex(context, indexA, getPlayerBuilderIndex(context, indexB));
    setValue(context, indexB, tmpValue);
    setProp(context, indexB, tmpProp);
    setFlag(context, indexB, tmpFlag);
    setPlayerBuilderIndex(context, indexB, tmpPlayerBuilderIndex);
}
/**
 * @param {?} context
 * @param {?} indexStartPosition
 * @return {?}
 */
function updateSinglePointerValues(context, indexStartPosition) {
    for (let i = indexStartPosition; i < context.length; i += 4 /* Size */) {
        /** @type {?} */
        const multiFlag = getPointers(context, i);
        /** @type {?} */
        const singleIndex = getMultiOrSingleIndex(multiFlag);
        if (singleIndex > 0) {
            /** @type {?} */
            const singleFlag = getPointers(context, singleIndex);
            /** @type {?} */
            const initialIndexForSingle = getInitialIndex(singleFlag);
            /** @type {?} */
            const flagValue = (isDirty(context, singleIndex) ? 1 /* Dirty */ : 0 /* None */) |
                (isClassBased(context, singleIndex) ? 2 /* Class */ : 0 /* None */) |
                (isSanitizable(context, singleIndex) ? 4 /* Sanitize */ : 0 /* None */);
            /** @type {?} */
            const updatedFlag = pointers(flagValue, initialIndexForSingle, i);
            setFlag(context, singleIndex, updatedFlag);
        }
    }
}
/**
 * @param {?} context
 * @param {?} index
 * @param {?} classBased
 * @param {?} name
 * @param {?} flag
 * @param {?} value
 * @param {?} playerIndex
 * @return {?}
 */
function insertNewMultiProperty(context, index, classBased, name, flag, value, playerIndex) {
    /** @type {?} */
    const doShift = index < context.length;
    // prop does not exist in the list, add it in
    context.splice(index, 0, flag | 1 /* Dirty */ | (classBased ? 2 /* Class */ : 0 /* None */), name, value, playerIndex);
    if (doShift) {
        // because the value was inserted midway into the array then we
        // need to update all the shifted multi values' single value
        // pointers to point to the newly shifted location
        updateSinglePointerValues(context, index + 4 /* Size */);
    }
}
/**
 * @param {?} value
 * @param {?=} isClassBased
 * @return {?}
 */
function valueExists(value, isClassBased) {
    if (isClassBased) {
        return value ? true : false;
    }
    return value !== null;
}
/**
 * @param {?} name
 * @param {?} isClassBased
 * @param {?=} sanitizer
 * @return {?}
 */
function prepareInitialFlag(name, isClassBased, sanitizer) {
    if (isClassBased) {
        return 2 /* Class */;
    }
    else if (sanitizer && sanitizer(name)) {
        return 4 /* Sanitize */;
    }
    return 0 /* None */;
}
/**
 * @param {?} flag
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function hasValueChanged(flag, a, b) {
    /** @type {?} */
    const isClassBased = flag & 2 /* Class */;
    /** @type {?} */
    const hasValues = a && b;
    /** @type {?} */
    const usesSanitizer = flag & 4 /* Sanitize */;
    // the toString() comparison ensures that a value is checked
    // ... otherwise (during sanitization bypassing) the === comparsion
    // would fail since a new String() instance is created
    if (!isClassBased && hasValues && usesSanitizer) {
        // we know for sure we're dealing with strings at this point
        return (/** @type {?} */ (a)).toString() !== (/** @type {?} */ (b)).toString();
    }
    // everything else is safe to check with a normal equality check
    return a !== b;
}
/**
 * @template T
 */
export class ClassAndStylePlayerBuilder {
    /**
     * @param {?} factory
     * @param {?} _element
     * @param {?} _type
     */
    constructor(factory, _element, _type) {
        this._element = _element;
        this._type = _type;
        this._values = {};
        this._dirty = false;
        this._factory = /** @type {?} */ (factory);
    }
    /**
     * @param {?} prop
     * @param {?} value
     * @return {?}
     */
    setValue(prop, value) {
        if (this._values[prop] !== value) {
            this._values[prop] = value;
            this._dirty = true;
        }
    }
    /**
     * @param {?=} currentPlayer
     * @return {?}
     */
    buildPlayer(currentPlayer) {
        // if no values have been set here then this means the binding didn't
        // change and therefore the binding values were not updated through
        // `setValue` which means no new player will be provided.
        if (this._dirty) {
            /** @type {?} */
            const player = this._factory.fn(this._element, this._type, /** @type {?} */ ((this._values)), currentPlayer || null);
            this._values = {};
            this._dirty = false;
            return player;
        }
        return undefined;
    }
}
if (false) {
    /** @type {?} */
    ClassAndStylePlayerBuilder.prototype._values;
    /** @type {?} */
    ClassAndStylePlayerBuilder.prototype._dirty;
    /** @type {?} */
    ClassAndStylePlayerBuilder.prototype._factory;
    /** @type {?} */
    ClassAndStylePlayerBuilder.prototype._element;
    /** @type {?} */
    ClassAndStylePlayerBuilder.prototype._type;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NfYW5kX3N0eWxlX2JpbmRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9zdHlsaW5nL2NsYXNzX2FuZF9zdHlsZV9iaW5kaW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBVUEsT0FBTyxFQUFZLG1CQUFtQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFHNUYsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUV2QyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUseUJBQXlCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBRTFHLE1BQU0sU0FBUyxHQUFVLEVBQUUsQ0FBQzs7QUFDNUIsTUFBTSxTQUFTLEdBQXlCLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCM0MsTUFBTSxVQUFVLDRCQUE0QixDQUN4Qyx3QkFBNEUsRUFDNUUsd0JBQTRFLEVBQzVFLGNBQXVDOztJQUN6QyxNQUFNLG9CQUFvQixHQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDOztJQUNuRCxNQUFNLE9BQU8sR0FDVCx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixDQUFDLENBQUM7O0lBRzFFLE1BQU0sWUFBWSxHQUE0QixFQUFFLENBQUM7O0lBQ2pELE1BQU0sYUFBYSxHQUE0QixFQUFFLENBQUM7O0lBRWxELElBQUksc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLElBQUksd0JBQXdCLEVBQUU7O1FBQzVCLElBQUkscUJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyx3QkFBd0IsQ0FBQyxNQUFN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LEtBQUssQ0FBQyxDQUFDO0NBQ2hCOzs7O0FBRUQsTUFBTSxPQUFPLDBCQUEwQjs7Ozs7O0lBS3JDLFlBQVksT0FBc0IsRUFBVSxRQUFxQixFQUFVLEtBQWtCO1FBQWpELGFBQVEsR0FBUixRQUFRLENBQWE7UUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFhO3VCQUozQyxFQUFFO3NCQUNuQyxLQUFLO1FBSXBCLElBQUksQ0FBQyxRQUFRLHFCQUFHLE9BQWMsQ0FBQSxDQUFDO0tBQ2hDOzs7Ozs7SUFFRCxRQUFRLENBQUMsSUFBWSxFQUFFLEtBQVU7UUFDL0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRTtZQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNwQjtLQUNGOzs7OztJQUVELFdBQVcsQ0FBQyxhQUEyQjs7OztRQUlyQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7O1lBQ2YsTUFBTSxNQUFNLEdBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxxQkFBRSxJQUFJLENBQUMsT0FBTyxJQUFJLGFBQWEsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixPQUFPLE1BQU0sQ0FBQztTQUNmO1FBRUQsT0FBTyxTQUFTLENBQUM7S0FDbEI7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7U3R5bGVTYW5pdGl6ZUZufSBmcm9tICcuLi8uLi9zYW5pdGl6YXRpb24vc3R5bGVfc2FuaXRpemVyJztcbmltcG9ydCB7SW5pdGlhbFN0eWxpbmdGbGFnc30gZnJvbSAnLi4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7QmluZGluZ1N0b3JlLCBCaW5kaW5nVHlwZSwgUGxheWVyLCBQbGF5ZXJCdWlsZGVyLCBQbGF5ZXJGYWN0b3J5LCBQbGF5ZXJJbmRleH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9wbGF5ZXInO1xuaW1wb3J0IHtSZW5kZXJlcjMsIFJlbmRlcmVyU3R5bGVGbGFnczMsIGlzUHJvY2VkdXJhbFJlbmRlcmVyfSBmcm9tICcuLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7SW5pdGlhbFN0eWxlcywgU3R5bGluZ0NvbnRleHQsIFN0eWxpbmdGbGFncywgU3R5bGluZ0luZGV4fSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0eWxpbmcnO1xuaW1wb3J0IHtMVmlld0RhdGEsIFJvb3RDb250ZXh0fSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRSb290Q29udGV4dH0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7Qm91bmRQbGF5ZXJGYWN0b3J5fSBmcm9tICcuL3BsYXllcl9mYWN0b3J5JztcbmltcG9ydCB7YWRkUGxheWVySW50ZXJuYWwsIGFsbG9jUGxheWVyQ29udGV4dCwgY3JlYXRlRW1wdHlTdHlsaW5nQ29udGV4dCwgZ2V0UGxheWVyQ29udGV4dH0gZnJvbSAnLi91dGlsJztcblxuY29uc3QgRU1QVFlfQVJSOiBhbnlbXSA9IFtdO1xuY29uc3QgRU1QVFlfT0JKOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0eWxpbmcgY29udGV4dCB0ZW1wbGF0ZSB3aGVyZSBzdHlsaW5nIGluZm9ybWF0aW9uIGlzIHN0b3JlZC5cbiAqIEFueSBzdHlsZXMgdGhhdCBhcmUgbGF0ZXIgcmVmZXJlbmNlZCB1c2luZyBgdXBkYXRlU3R5bGVQcm9wYCBtdXN0IGJlXG4gKiBwYXNzZWQgaW4gd2l0aGluIHRoaXMgZnVuY3Rpb24uIEluaXRpYWwgdmFsdWVzIGZvciB0aG9zZSBzdHlsZXMgYXJlIHRvXG4gKiBiZSBkZWNsYXJlZCBhZnRlciBhbGwgaW5pdGlhbCBzdHlsZSBwcm9wZXJ0aWVzIGFyZSBkZWNsYXJlZCAodGhpcyBjaGFuZ2UgaW5cbiAqIG1vZGUgYmV0d2VlbiBkZWNsYXJhdGlvbnMgYW5kIGluaXRpYWwgc3R5bGVzIGlzIG1hZGUgcG9zc2libGUgdXNpbmcgYSBzcGVjaWFsXG4gKiBlbnVtIHZhbHVlIGZvdW5kIGluIGBkZWZpbml0aW9uLnRzYCkuXG4gKlxuICogQHBhcmFtIGluaXRpYWxTdHlsZURlY2xhcmF0aW9ucyBhIGxpc3Qgb2Ygc3R5bGUgZGVjbGFyYXRpb25zIGFuZCBpbml0aWFsIHN0eWxlIHZhbHVlc1xuICogICAgdGhhdCBhcmUgdXNlZCBsYXRlciB3aXRoaW4gdGhlIHN0eWxpbmcgY29udGV4dC5cbiAqXG4gKiAgICAtPiBbJ3dpZHRoJywgJ2hlaWdodCcsIFNQRUNJQUxfRU5VTV9WQUwsICd3aWR0aCcsICcxMDBweCddXG4gKiAgICAgICBUaGlzIGltcGxpZXMgdGhhdCBgd2lkdGhgIGFuZCBgaGVpZ2h0YCB3aWxsIGJlIGxhdGVyIHN0eWxlZCBhbmQgdGhhdCB0aGUgYHdpZHRoYFxuICogICAgICAgcHJvcGVydHkgaGFzIGFuIGluaXRpYWwgdmFsdWUgb2YgYDEwMHB4YC5cbiAqXG4gKiBAcGFyYW0gaW5pdGlhbENsYXNzRGVjbGFyYXRpb25zIGEgbGlzdCBvZiBjbGFzcyBkZWNsYXJhdGlvbnMgYW5kIGluaXRpYWwgY2xhc3MgdmFsdWVzXG4gKiAgICB0aGF0IGFyZSB1c2VkIGxhdGVyIHdpdGhpbiB0aGUgc3R5bGluZyBjb250ZXh0LlxuICpcbiAqICAgIC0+IFsnZm9vJywgJ2JhcicsIFNQRUNJQUxfRU5VTV9WQUwsICdmb28nLCB0cnVlXVxuICogICAgICAgVGhpcyBpbXBsaWVzIHRoYXQgYGZvb2AgYW5kIGBiYXJgIHdpbGwgYmUgbGF0ZXIgc3R5bGVkIGFuZCB0aGF0IHRoZSBgZm9vYFxuICogICAgICAgY2xhc3Mgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBlbGVtZW50IGFzIGFuIGluaXRpYWwgY2xhc3Mgc2luY2UgaXQncyB0cnVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdHlsaW5nQ29udGV4dFRlbXBsYXRlKFxuICAgIGluaXRpYWxDbGFzc0RlY2xhcmF0aW9ucz86IChzdHJpbmcgfCBib29sZWFuIHwgSW5pdGlhbFN0eWxpbmdGbGFncylbXSB8IG51bGwsXG4gICAgaW5pdGlhbFN0eWxlRGVjbGFyYXRpb25zPzogKHN0cmluZyB8IGJvb2xlYW4gfCBJbml0aWFsU3R5bGluZ0ZsYWdzKVtdIHwgbnVsbCxcbiAgICBzdHlsZVNhbml0aXplcj86IFN0eWxlU2FuaXRpemVGbiB8IG51bGwpOiBTdHlsaW5nQ29udGV4dCB7XG4gIGNvbnN0IGluaXRpYWxTdHlsaW5nVmFsdWVzOiBJbml0aWFsU3R5bGVzID0gW251bGxdO1xuICBjb25zdCBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCA9XG4gICAgICBjcmVhdGVFbXB0eVN0eWxpbmdDb250ZXh0KG51bGwsIHN0eWxlU2FuaXRpemVyLCBpbml0aWFsU3R5bGluZ1ZhbHVlcyk7XG5cbiAgLy8gd2UgdXNlIHR3byBtYXBzIHNpbmNlIGEgY2xhc3MgbmFtZSBtaWdodCBjb2xsaWRlIHdpdGggYSBDU1Mgc3R5bGUgcHJvcFxuICBjb25zdCBzdHlsZXNMb29rdXA6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge307XG4gIGNvbnN0IGNsYXNzZXNMb29rdXA6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9ID0ge307XG5cbiAgbGV0IHRvdGFsU3R5bGVEZWNsYXJhdGlvbnMgPSAwO1xuICBpZiAoaW5pdGlhbFN0eWxlRGVjbGFyYXRpb25zKSB7XG4gICAgbGV0IGhhc1Bhc3NlZERlY2xhcmF0aW9ucyA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5pdGlhbFN0eWxlRGVjbGFyYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB2ID0gaW5pdGlhbFN0eWxlRGVjbGFyYXRpb25zW2ldIGFzIHN0cmluZyB8IEluaXRpYWxTdHlsaW5nRmxhZ3M7XG5cbiAgICAgIC8vIHRoaXMgZmxhZyB2YWx1ZSBtYXJrcyB3aGVyZSB0aGUgZGVjbGFyYXRpb25zIGVuZCB0aGUgaW5pdGlhbCB2YWx1ZXMgYmVnaW5cbiAgICAgIGlmICh2ID09PSBJbml0aWFsU3R5bGluZ0ZsYWdzLlZBTFVFU19NT0RFKSB7XG4gICAgICAgIGhhc1Bhc3NlZERlY2xhcmF0aW9ucyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBwcm9wID0gdiBhcyBzdHJpbmc7XG4gICAgICAgIGlmIChoYXNQYXNzZWREZWNsYXJhdGlvbnMpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IGluaXRpYWxTdHlsZURlY2xhcmF0aW9uc1srK2ldIGFzIHN0cmluZztcbiAgICAgICAgICBpbml0aWFsU3R5bGluZ1ZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICBzdHlsZXNMb29rdXBbcHJvcF0gPSBpbml0aWFsU3R5bGluZ1ZhbHVlcy5sZW5ndGggLSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvdGFsU3R5bGVEZWNsYXJhdGlvbnMrKztcbiAgICAgICAgICBzdHlsZXNMb29rdXBbcHJvcF0gPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbWFrZSB3aGVyZSB0aGUgY2xhc3Mgb2Zmc2V0cyBiZWdpblxuICBjb250ZXh0W1N0eWxpbmdJbmRleC5DbGFzc09mZnNldFBvc2l0aW9uXSA9IHRvdGFsU3R5bGVEZWNsYXJhdGlvbnM7XG5cbiAgaWYgKGluaXRpYWxDbGFzc0RlY2xhcmF0aW9ucykge1xuICAgIGxldCBoYXNQYXNzZWREZWNsYXJhdGlvbnMgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluaXRpYWxDbGFzc0RlY2xhcmF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdiA9IGluaXRpYWxDbGFzc0RlY2xhcmF0aW9uc1tpXSBhcyBzdHJpbmcgfCBib29sZWFuIHwgSW5pdGlhbFN0eWxpbmdGbGFncztcbiAgICAgIC8vIHRoaXMgZmxhZyB2YWx1ZSBtYXJrcyB3aGVyZSB0aGUgZGVjbGFyYXRpb25zIGVuZCB0aGUgaW5pdGlhbCB2YWx1ZXMgYmVnaW5cbiAgICAgIGlmICh2ID09PSBJbml0aWFsU3R5bGluZ0ZsYWdzLlZBTFVFU19NT0RFKSB7XG4gICAgICAgIGhhc1Bhc3NlZERlY2xhcmF0aW9ucyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSB2IGFzIHN0cmluZztcbiAgICAgICAgaWYgKGhhc1Bhc3NlZERlY2xhcmF0aW9ucykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gaW5pdGlhbENsYXNzRGVjbGFyYXRpb25zWysraV0gYXMgYm9vbGVhbjtcbiAgICAgICAgICBpbml0aWFsU3R5bGluZ1ZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICBjbGFzc2VzTG9va3VwW2NsYXNzTmFtZV0gPSBpbml0aWFsU3R5bGluZ1ZhbHVlcy5sZW5ndGggLSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsYXNzZXNMb29rdXBbY2xhc3NOYW1lXSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBzdHlsZVByb3BzID0gT2JqZWN0LmtleXMoc3R5bGVzTG9va3VwKTtcbiAgY29uc3QgY2xhc3NOYW1lcyA9IE9iamVjdC5rZXlzKGNsYXNzZXNMb29rdXApO1xuICBjb25zdCBjbGFzc05hbWVzSW5kZXhTdGFydCA9IHN0eWxlUHJvcHMubGVuZ3RoO1xuICBjb25zdCB0b3RhbFByb3BzID0gc3R5bGVQcm9wcy5sZW5ndGggKyBjbGFzc05hbWVzLmxlbmd0aDtcblxuICAvLyAqMiBiZWNhdXNlIHdlIGFyZSBmaWxsaW5nIGZvciBib3RoIHNpbmdsZSBhbmQgbXVsdGkgc3R5bGUgc3BhY2VzXG4gIGNvbnN0IG1heExlbmd0aCA9IHRvdGFsUHJvcHMgKiBTdHlsaW5nSW5kZXguU2l6ZSAqIDIgKyBTdHlsaW5nSW5kZXguU2luZ2xlU3R5bGVzU3RhcnRQb3NpdGlvbjtcblxuICAvLyB3ZSBuZWVkIHRvIGZpbGwgdGhlIGFycmF5IGZyb20gdGhlIHN0YXJ0IHNvIHRoYXQgd2UgY2FuIGFjY2Vzc1xuICAvLyBib3RoIHRoZSBtdWx0aSBhbmQgdGhlIHNpbmdsZSBhcnJheSBwb3NpdGlvbnMgaW4gdGhlIHNhbWUgbG9vcCBibG9ja1xuICBmb3IgKGxldCBpID0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb247IGkgPCBtYXhMZW5ndGg7IGkrKykge1xuICAgIGNvbnRleHQucHVzaChudWxsKTtcbiAgfVxuXG4gIGNvbnN0IHNpbmdsZVN0YXJ0ID0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb247XG4gIGNvbnN0IG11bHRpU3RhcnQgPSB0b3RhbFByb3BzICogU3R5bGluZ0luZGV4LlNpemUgKyBTdHlsaW5nSW5kZXguU2luZ2xlU3R5bGVzU3RhcnRQb3NpdGlvbjtcblxuICAvLyBmaWxsIHNpbmdsZSBhbmQgbXVsdGktbGV2ZWwgc3R5bGVzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWxQcm9wczsgaSsrKSB7XG4gICAgY29uc3QgaXNDbGFzc0Jhc2VkID0gaSA+PSBjbGFzc05hbWVzSW5kZXhTdGFydDtcbiAgICBjb25zdCBwcm9wID0gaXNDbGFzc0Jhc2VkID8gY2xhc3NOYW1lc1tpIC0gY2xhc3NOYW1lc0luZGV4U3RhcnRdIDogc3R5bGVQcm9wc1tpXTtcbiAgICBjb25zdCBpbmRleEZvckluaXRpYWwgPSBpc0NsYXNzQmFzZWQgPyBjbGFzc2VzTG9va3VwW3Byb3BdIDogc3R5bGVzTG9va3VwW3Byb3BdO1xuICAgIGNvbnN0IGluaXRpYWxWYWx1ZSA9IGluaXRpYWxTdHlsaW5nVmFsdWVzW2luZGV4Rm9ySW5pdGlhbF07XG5cbiAgICBjb25zdCBpbmRleEZvck11bHRpID0gaSAqIFN0eWxpbmdJbmRleC5TaXplICsgbXVsdGlTdGFydDtcbiAgICBjb25zdCBpbmRleEZvclNpbmdsZSA9IGkgKiBTdHlsaW5nSW5kZXguU2l6ZSArIHNpbmdsZVN0YXJ0O1xuICAgIGNvbnN0IGluaXRpYWxGbGFnID0gcHJlcGFyZUluaXRpYWxGbGFnKHByb3AsIGlzQ2xhc3NCYXNlZCwgc3R5bGVTYW5pdGl6ZXIgfHwgbnVsbCk7XG5cbiAgICBzZXRGbGFnKGNvbnRleHQsIGluZGV4Rm9yU2luZ2xlLCBwb2ludGVycyhpbml0aWFsRmxhZywgaW5kZXhGb3JJbml0aWFsLCBpbmRleEZvck11bHRpKSk7XG4gICAgc2V0UHJvcChjb250ZXh0LCBpbmRleEZvclNpbmdsZSwgcHJvcCk7XG4gICAgc2V0VmFsdWUoY29udGV4dCwgaW5kZXhGb3JTaW5nbGUsIG51bGwpO1xuICAgIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBpbmRleEZvclNpbmdsZSwgMCk7XG5cbiAgICBjb25zdCBmbGFnRm9yTXVsdGkgPVxuICAgICAgICBpbml0aWFsRmxhZyB8IChpbml0aWFsVmFsdWUgIT09IG51bGwgPyBTdHlsaW5nRmxhZ3MuRGlydHkgOiBTdHlsaW5nRmxhZ3MuTm9uZSk7XG4gICAgc2V0RmxhZyhjb250ZXh0LCBpbmRleEZvck11bHRpLCBwb2ludGVycyhmbGFnRm9yTXVsdGksIGluZGV4Rm9ySW5pdGlhbCwgaW5kZXhGb3JTaW5nbGUpKTtcbiAgICBzZXRQcm9wKGNvbnRleHQsIGluZGV4Rm9yTXVsdGksIHByb3ApO1xuICAgIHNldFZhbHVlKGNvbnRleHQsIGluZGV4Rm9yTXVsdGksIG51bGwpO1xuICAgIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBpbmRleEZvck11bHRpLCAwKTtcbiAgfVxuXG4gIC8vIHRoZXJlIGlzIG5vIGluaXRpYWwgdmFsdWUgZmxhZyBmb3IgdGhlIG1hc3RlciBpbmRleCBzaW5jZSBpdCBkb2Vzbid0XG4gIC8vIHJlZmVyZW5jZSBhbiBpbml0aWFsIHN0eWxlIHZhbHVlXG4gIHNldEZsYWcoY29udGV4dCwgU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbiwgcG9pbnRlcnMoMCwgMCwgbXVsdGlTdGFydCkpO1xuICBzZXRDb250ZXh0RGlydHkoY29udGV4dCwgaW5pdGlhbFN0eWxpbmdWYWx1ZXMubGVuZ3RoID4gMSk7XG5cbiAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbi8qKlxuICogU2V0cyBhbmQgcmVzb2x2ZXMgYWxsIGBtdWx0aWAgc3R5bGluZyBvbiBhbiBgU3R5bGluZ0NvbnRleHRgIHNvIHRoYXQgdGhleSBjYW4gYmVcbiAqIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgb25jZSBgcmVuZGVyU3R5bGVBbmRDbGFzc0JpbmRpbmdzYCBpcyBjYWxsZWQuXG4gKlxuICogQWxsIG1pc3Npbmcgc3R5bGVzL2NsYXNzIChhbnkgdmFsdWVzIHRoYXQgYXJlIG5vdCBwcm92aWRlZCBpbiB0aGUgbmV3IGBzdHlsZXNgXG4gKiBvciBgY2xhc3Nlc2AgcGFyYW1zKSB3aWxsIHJlc29sdmUgdG8gYG51bGxgIHdpdGhpbiB0aGVpciByZXNwZWN0aXZlIHBvc2l0aW9uc1xuICogaW4gdGhlIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIGNvbnRleHQgVGhlIHN0eWxpbmcgY29udGV4dCB0aGF0IHdpbGwgYmUgdXBkYXRlZCB3aXRoIHRoZVxuICogICAgbmV3bHkgcHJvdmlkZWQgc3R5bGUgdmFsdWVzLlxuICogQHBhcmFtIGNsYXNzZXNJbnB1dCBUaGUga2V5L3ZhbHVlIG1hcCBvZiBDU1MgY2xhc3MgbmFtZXMgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHRoZSB1cGRhdGUuXG4gKiBAcGFyYW0gc3R5bGVzSW5wdXQgVGhlIGtleS92YWx1ZSBtYXAgb2YgQ1NTIHN0eWxlcyB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgdGhlIHVwZGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVN0eWxpbmdNYXAoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGNsYXNzZXNJbnB1dDoge1trZXk6IHN0cmluZ106IGFueX0gfCBzdHJpbmcgfFxuICAgICAgICBCb3VuZFBsYXllckZhY3Rvcnk8bnVsbHxzdHJpbmd8e1trZXk6IHN0cmluZ106IGFueX0+fCBudWxsLFxuICAgIHN0eWxlc0lucHV0Pzoge1trZXk6IHN0cmluZ106IGFueX0gfCBCb3VuZFBsYXllckZhY3Rvcnk8bnVsbHx7W2tleTogc3RyaW5nXTogYW55fT58XG4gICAgICAgIG51bGwpOiB2b2lkIHtcbiAgc3R5bGVzSW5wdXQgPSBzdHlsZXNJbnB1dCB8fCBudWxsO1xuXG4gIGNvbnN0IGVsZW1lbnQgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5FbGVtZW50UG9zaXRpb25dICFhcyBIVE1MRWxlbWVudDtcbiAgY29uc3QgY2xhc3Nlc1BsYXllckJ1aWxkZXIgPSBjbGFzc2VzSW5wdXQgaW5zdGFuY2VvZiBCb3VuZFBsYXllckZhY3RvcnkgP1xuICAgICAgbmV3IENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyKGNsYXNzZXNJbnB1dCBhcyBhbnksIGVsZW1lbnQsIEJpbmRpbmdUeXBlLkNsYXNzKSA6XG4gICAgICBudWxsO1xuICBjb25zdCBzdHlsZXNQbGF5ZXJCdWlsZGVyID0gc3R5bGVzSW5wdXQgaW5zdGFuY2VvZiBCb3VuZFBsYXllckZhY3RvcnkgP1xuICAgICAgbmV3IENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyKHN0eWxlc0lucHV0IGFzIGFueSwgZWxlbWVudCwgQmluZGluZ1R5cGUuU3R5bGUpIDpcbiAgICAgIG51bGw7XG5cbiAgY29uc3QgY2xhc3Nlc1ZhbHVlID0gY2xhc3Nlc1BsYXllckJ1aWxkZXIgP1xuICAgICAgKGNsYXNzZXNJbnB1dCBhcyBCb3VuZFBsYXllckZhY3Rvcnk8e1trZXk6IHN0cmluZ106IGFueX18c3RyaW5nPikgIS52YWx1ZSA6XG4gICAgICBjbGFzc2VzSW5wdXQ7XG4gIGNvbnN0IHN0eWxlc1ZhbHVlID0gc3R5bGVzUGxheWVyQnVpbGRlciA/IHN0eWxlc0lucHV0ICEudmFsdWUgOiBzdHlsZXNJbnB1dDtcblxuICAvLyBlYXJseSBleGl0ICh0aGlzIGlzIHdoYXQncyBkb25lIHRvIGF2b2lkIHVzaW5nIGN0eC5iaW5kKCkgdG8gY2FjaGUgdGhlIHZhbHVlKVxuICBjb25zdCBpZ25vcmVBbGxDbGFzc1VwZGF0ZXMgPSBjbGFzc2VzVmFsdWUgPT09IGNvbnRleHRbU3R5bGluZ0luZGV4LlByZXZpb3VzTXVsdGlDbGFzc1ZhbHVlXTtcbiAgY29uc3QgaWdub3JlQWxsU3R5bGVVcGRhdGVzID0gc3R5bGVzVmFsdWUgPT09IGNvbnRleHRbU3R5bGluZ0luZGV4LlByZXZpb3VzTXVsdGlTdHlsZVZhbHVlXTtcbiAgaWYgKGlnbm9yZUFsbENsYXNzVXBkYXRlcyAmJiBpZ25vcmVBbGxTdHlsZVVwZGF0ZXMpIHJldHVybjtcblxuICBjb250ZXh0W1N0eWxpbmdJbmRleC5QcmV2aW91c011bHRpQ2xhc3NWYWx1ZV0gPSBjbGFzc2VzVmFsdWU7XG4gIGNvbnRleHRbU3R5bGluZ0luZGV4LlByZXZpb3VzTXVsdGlTdHlsZVZhbHVlXSA9IHN0eWxlc1ZhbHVlO1xuXG4gIGxldCBjbGFzc05hbWVzOiBzdHJpbmdbXSA9IEVNUFRZX0FSUjtcbiAgbGV0IGFwcGx5QWxsQ2xhc3NlcyA9IGZhbHNlO1xuICBsZXQgcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSA9IGZhbHNlO1xuXG4gIGNvbnN0IGNsYXNzZXNQbGF5ZXJCdWlsZGVySW5kZXggPVxuICAgICAgY2xhc3Nlc1BsYXllckJ1aWxkZXIgPyBQbGF5ZXJJbmRleC5DbGFzc01hcFBsYXllckJ1aWxkZXJQb3NpdGlvbiA6IDA7XG4gIGlmIChoYXNQbGF5ZXJCdWlsZGVyQ2hhbmdlZChcbiAgICAgICAgICBjb250ZXh0LCBjbGFzc2VzUGxheWVyQnVpbGRlciwgUGxheWVySW5kZXguQ2xhc3NNYXBQbGF5ZXJCdWlsZGVyUG9zaXRpb24pKSB7XG4gICAgc2V0UGxheWVyQnVpbGRlcihjb250ZXh0LCBjbGFzc2VzUGxheWVyQnVpbGRlciwgUGxheWVySW5kZXguQ2xhc3NNYXBQbGF5ZXJCdWlsZGVyUG9zaXRpb24pO1xuICAgIHBsYXllckJ1aWxkZXJzQXJlRGlydHkgPSB0cnVlO1xuICB9XG5cbiAgY29uc3Qgc3R5bGVzUGxheWVyQnVpbGRlckluZGV4ID1cbiAgICAgIHN0eWxlc1BsYXllckJ1aWxkZXIgPyBQbGF5ZXJJbmRleC5TdHlsZU1hcFBsYXllckJ1aWxkZXJQb3NpdGlvbiA6IDA7XG4gIGlmIChoYXNQbGF5ZXJCdWlsZGVyQ2hhbmdlZChcbiAgICAgICAgICBjb250ZXh0LCBzdHlsZXNQbGF5ZXJCdWlsZGVyLCBQbGF5ZXJJbmRleC5TdHlsZU1hcFBsYXllckJ1aWxkZXJQb3NpdGlvbikpIHtcbiAgICBzZXRQbGF5ZXJCdWlsZGVyKGNvbnRleHQsIHN0eWxlc1BsYXllckJ1aWxkZXIsIFBsYXllckluZGV4LlN0eWxlTWFwUGxheWVyQnVpbGRlclBvc2l0aW9uKTtcbiAgICBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIGVhY2ggdGltZSBhIHN0cmluZy1iYXNlZCB2YWx1ZSBwb3BzIHVwIHRoZW4gaXQgc2hvdWxkbid0IHJlcXVpcmUgYSBkZWVwXG4gIC8vIGNoZWNrIG9mIHdoYXQncyBjaGFuZ2VkLlxuICBpZiAoIWlnbm9yZUFsbENsYXNzVXBkYXRlcykge1xuICAgIGlmICh0eXBlb2YgY2xhc3Nlc1ZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgICBjbGFzc05hbWVzID0gY2xhc3Nlc1ZhbHVlLnNwbGl0KC9cXHMrLyk7XG4gICAgICAvLyB0aGlzIGJvb2xlYW4gaXMgdXNlZCB0byBhdm9pZCBoYXZpbmcgdG8gY3JlYXRlIGEga2V5L3ZhbHVlIG1hcCBvZiBgdHJ1ZWAgdmFsdWVzXG4gICAgICAvLyBzaW5jZSBhIGNsYXNzbmFtZSBzdHJpbmcgaW1wbGllcyB0aGF0IGFsbCB0aG9zZSBjbGFzc2VzIGFyZSBhZGRlZFxuICAgICAgYXBwbHlBbGxDbGFzc2VzID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xhc3NOYW1lcyA9IGNsYXNzZXNWYWx1ZSA/IE9iamVjdC5rZXlzKGNsYXNzZXNWYWx1ZSkgOiBFTVBUWV9BUlI7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2xhc3NlcyA9IChjbGFzc2VzVmFsdWUgfHwgRU1QVFlfT0JKKSBhc3tba2V5OiBzdHJpbmddOiBhbnl9O1xuICBjb25zdCBzdHlsZVByb3BzID0gc3R5bGVzVmFsdWUgPyBPYmplY3Qua2V5cyhzdHlsZXNWYWx1ZSkgOiBFTVBUWV9BUlI7XG4gIGNvbnN0IHN0eWxlcyA9IHN0eWxlc1ZhbHVlIHx8IEVNUFRZX09CSjtcblxuICBjb25zdCBjbGFzc2VzU3RhcnRJbmRleCA9IHN0eWxlUHJvcHMubGVuZ3RoO1xuICBjb25zdCBtdWx0aVN0YXJ0SW5kZXggPSBnZXRNdWx0aVN0YXJ0SW5kZXgoY29udGV4dCk7XG5cbiAgbGV0IGRpcnR5ID0gZmFsc2U7XG4gIGxldCBjdHhJbmRleCA9IG11bHRpU3RhcnRJbmRleDtcblxuICBsZXQgcHJvcEluZGV4ID0gMDtcbiAgY29uc3QgcHJvcExpbWl0ID0gc3R5bGVQcm9wcy5sZW5ndGggKyBjbGFzc05hbWVzLmxlbmd0aDtcblxuICAvLyB0aGUgbWFpbiBsb29wIGhlcmUgd2lsbCB0cnkgYW5kIGZpZ3VyZSBvdXQgaG93IHRoZSBzaGFwZSBvZiB0aGUgcHJvdmlkZWRcbiAgLy8gc3R5bGVzIGRpZmZlciB3aXRoIHJlc3BlY3QgdG8gdGhlIGNvbnRleHQuIExhdGVyIGlmIHRoZSBjb250ZXh0L3N0eWxlcy9jbGFzc2VzXG4gIC8vIGFyZSBvZmYtYmFsYW5jZSB0aGVuIHRoZXkgd2lsbCBiZSBkZWFsdCBpbiBhbm90aGVyIGxvb3AgYWZ0ZXIgdGhpcyBvbmVcbiAgd2hpbGUgKGN0eEluZGV4IDwgY29udGV4dC5sZW5ndGggJiYgcHJvcEluZGV4IDwgcHJvcExpbWl0KSB7XG4gICAgY29uc3QgaXNDbGFzc0Jhc2VkID0gcHJvcEluZGV4ID49IGNsYXNzZXNTdGFydEluZGV4O1xuICAgIGNvbnN0IHByb2Nlc3NWYWx1ZSA9XG4gICAgICAgICghaXNDbGFzc0Jhc2VkICYmICFpZ25vcmVBbGxTdHlsZVVwZGF0ZXMpIHx8IChpc0NsYXNzQmFzZWQgJiYgIWlnbm9yZUFsbENsYXNzVXBkYXRlcyk7XG5cbiAgICAvLyB3aGVuIHRoZXJlIGlzIGEgY2FjaGUtaGl0IGZvciBhIHN0cmluZy1iYXNlZCBjbGFzcyB0aGVuIHdlIHNob3VsZFxuICAgIC8vIGF2b2lkIGRvaW5nIGFueSB3b3JrIGRpZmZpbmcgYW55IG9mIHRoZSBjaGFuZ2VzXG4gICAgaWYgKHByb2Nlc3NWYWx1ZSkge1xuICAgICAgY29uc3QgYWRqdXN0ZWRQcm9wSW5kZXggPSBpc0NsYXNzQmFzZWQgPyBwcm9wSW5kZXggLSBjbGFzc2VzU3RhcnRJbmRleCA6IHByb3BJbmRleDtcbiAgICAgIGNvbnN0IG5ld1Byb3A6IHN0cmluZyA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gY2xhc3NOYW1lc1thZGp1c3RlZFByb3BJbmRleF0gOiBzdHlsZVByb3BzW2FkanVzdGVkUHJvcEluZGV4XTtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlOiBzdHJpbmd8Ym9vbGVhbiA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gKGFwcGx5QWxsQ2xhc3NlcyA/IHRydWUgOiBjbGFzc2VzW25ld1Byb3BdKSA6IHN0eWxlc1tuZXdQcm9wXTtcbiAgICAgIGNvbnN0IHBsYXllckJ1aWxkZXJJbmRleCA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gY2xhc3Nlc1BsYXllckJ1aWxkZXJJbmRleCA6IHN0eWxlc1BsYXllckJ1aWxkZXJJbmRleDtcblxuICAgICAgY29uc3QgcHJvcCA9IGdldFByb3AoY29udGV4dCwgY3R4SW5kZXgpO1xuICAgICAgaWYgKHByb3AgPT09IG5ld1Byb3ApIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRWYWx1ZShjb250ZXh0LCBjdHhJbmRleCk7XG4gICAgICAgIGNvbnN0IGZsYWcgPSBnZXRQb2ludGVycyhjb250ZXh0LCBjdHhJbmRleCk7XG4gICAgICAgIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBjdHhJbmRleCwgcGxheWVyQnVpbGRlckluZGV4KTtcblxuICAgICAgICBpZiAoaGFzVmFsdWVDaGFuZ2VkKGZsYWcsIHZhbHVlLCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICBzZXRWYWx1ZShjb250ZXh0LCBjdHhJbmRleCwgbmV3VmFsdWUpO1xuICAgICAgICAgIHBsYXllckJ1aWxkZXJzQXJlRGlydHkgPSBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5IHx8ICEhcGxheWVyQnVpbGRlckluZGV4O1xuXG4gICAgICAgICAgY29uc3QgaW5pdGlhbFZhbHVlID0gZ2V0SW5pdGlhbFZhbHVlKGNvbnRleHQsIGZsYWcpO1xuXG4gICAgICAgICAgLy8gdGhlcmUgaXMgbm8gcG9pbnQgaW4gc2V0dGluZyB0aGlzIHRvIGRpcnR5IGlmIHRoZSBwcmV2aW91c2x5XG4gICAgICAgICAgLy8gcmVuZGVyZWQgdmFsdWUgd2FzIGJlaW5nIHJlZmVyZW5jZWQgYnkgdGhlIGluaXRpYWwgc3R5bGUgKG9yIG51bGwpXG4gICAgICAgICAgaWYgKGhhc1ZhbHVlQ2hhbmdlZChmbGFnLCBpbml0aWFsVmFsdWUsIG5ld1ZhbHVlKSkge1xuICAgICAgICAgICAgc2V0RGlydHkoY29udGV4dCwgY3R4SW5kZXgsIHRydWUpO1xuICAgICAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaW5kZXhPZkVudHJ5ID0gZmluZEVudHJ5UG9zaXRpb25CeVByb3AoY29udGV4dCwgbmV3UHJvcCwgY3R4SW5kZXgpO1xuICAgICAgICBpZiAoaW5kZXhPZkVudHJ5ID4gMCkge1xuICAgICAgICAgIC8vIGl0IHdhcyBmb3VuZCBhdCBhIGxhdGVyIHBvaW50IC4uLiBqdXN0IHN3YXAgdGhlIHZhbHVlc1xuICAgICAgICAgIGNvbnN0IHZhbHVlVG9Db21wYXJlID0gZ2V0VmFsdWUoY29udGV4dCwgaW5kZXhPZkVudHJ5KTtcbiAgICAgICAgICBjb25zdCBmbGFnVG9Db21wYXJlID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgaW5kZXhPZkVudHJ5KTtcbiAgICAgICAgICBzd2FwTXVsdGlDb250ZXh0RW50cmllcyhjb250ZXh0LCBjdHhJbmRleCwgaW5kZXhPZkVudHJ5KTtcbiAgICAgICAgICBpZiAoaGFzVmFsdWVDaGFuZ2VkKGZsYWdUb0NvbXBhcmUsIHZhbHVlVG9Db21wYXJlLCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWxWYWx1ZSA9IGdldEluaXRpYWxWYWx1ZShjb250ZXh0LCBmbGFnVG9Db21wYXJlKTtcbiAgICAgICAgICAgIHNldFZhbHVlKGNvbnRleHQsIGN0eEluZGV4LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICBpZiAoaGFzVmFsdWVDaGFuZ2VkKGZsYWdUb0NvbXBhcmUsIGluaXRpYWxWYWx1ZSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgICAgIHNldERpcnR5KGNvbnRleHQsIGN0eEluZGV4LCB0cnVlKTtcbiAgICAgICAgICAgICAgcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSA9IHBsYXllckJ1aWxkZXJzQXJlRGlydHkgfHwgISFwbGF5ZXJCdWlsZGVySW5kZXg7XG4gICAgICAgICAgICAgIGRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gd2Ugb25seSBjYXJlIHRvIGRvIHRoaXMgaWYgdGhlIGluc2VydGlvbiBpcyBpbiB0aGUgbWlkZGxlXG4gICAgICAgICAgY29uc3QgbmV3RmxhZyA9IHByZXBhcmVJbml0aWFsRmxhZyhuZXdQcm9wLCBpc0NsYXNzQmFzZWQsIGdldFN0eWxlU2FuaXRpemVyKGNvbnRleHQpKTtcbiAgICAgICAgICBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5ID0gcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSB8fCAhIXBsYXllckJ1aWxkZXJJbmRleDtcbiAgICAgICAgICBpbnNlcnROZXdNdWx0aVByb3BlcnR5KFxuICAgICAgICAgICAgICBjb250ZXh0LCBjdHhJbmRleCwgaXNDbGFzc0Jhc2VkLCBuZXdQcm9wLCBuZXdGbGFnLCBuZXdWYWx1ZSwgcGxheWVyQnVpbGRlckluZGV4KTtcbiAgICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjdHhJbmRleCArPSBTdHlsaW5nSW5kZXguU2l6ZTtcbiAgICBwcm9wSW5kZXgrKztcbiAgfVxuXG4gIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGVyZSBhcmUgbGVmdC1vdmVyIHZhbHVlcyBpbiB0aGUgY29udGV4dCB0aGF0XG4gIC8vIHdlcmUgbm90IGluY2x1ZGVkIGluIHRoZSBwcm92aWRlZCBzdHlsZXMvY2xhc3NlcyBhbmQgaW4gdGhpc1xuICAvLyBjYXNlIHRoZSAgZ29hbCBpcyB0byBcInJlbW92ZVwiIHRoZW0gZnJvbSB0aGUgY29udGV4dCAoYnkgbnVsbGlmeWluZylcbiAgd2hpbGUgKGN0eEluZGV4IDwgY29udGV4dC5sZW5ndGgpIHtcbiAgICBjb25zdCBmbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgY3R4SW5kZXgpO1xuICAgIGNvbnN0IGlzQ2xhc3NCYXNlZCA9IChmbGFnICYgU3R5bGluZ0ZsYWdzLkNsYXNzKSA9PT0gU3R5bGluZ0ZsYWdzLkNsYXNzO1xuICAgIGNvbnN0IHByb2Nlc3NWYWx1ZSA9XG4gICAgICAgICghaXNDbGFzc0Jhc2VkICYmICFpZ25vcmVBbGxTdHlsZVVwZGF0ZXMpIHx8IChpc0NsYXNzQmFzZWQgJiYgIWlnbm9yZUFsbENsYXNzVXBkYXRlcyk7XG4gICAgaWYgKHByb2Nlc3NWYWx1ZSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBnZXRWYWx1ZShjb250ZXh0LCBjdHhJbmRleCk7XG4gICAgICBjb25zdCBkb1JlbW92ZVZhbHVlID0gdmFsdWVFeGlzdHModmFsdWUsIGlzQ2xhc3NCYXNlZCk7XG4gICAgICBpZiAoZG9SZW1vdmVWYWx1ZSkge1xuICAgICAgICBzZXREaXJ0eShjb250ZXh0LCBjdHhJbmRleCwgdHJ1ZSk7XG4gICAgICAgIHNldFZhbHVlKGNvbnRleHQsIGN0eEluZGV4LCBudWxsKTtcblxuICAgICAgICAvLyB3ZSBrZWVwIHRoZSBwbGF5ZXIgZmFjdG9yeSB0aGUgc2FtZSBzbyB0aGF0IHRoZSBgbnVsbGVkYCB2YWx1ZSBjYW5cbiAgICAgICAgLy8gYmUgaW5zdHJ1Y3RlZCBpbnRvIHRoZSBwbGF5ZXIgYmVjYXVzZSByZW1vdmluZyBhIHN0eWxlIGFuZC9vciBhIGNsYXNzXG4gICAgICAgIC8vIGlzIGEgdmFsaWQgYW5pbWF0aW9uIHBsYXllciBpbnN0cnVjdGlvbi5cbiAgICAgICAgY29uc3QgcGxheWVyQnVpbGRlckluZGV4ID1cbiAgICAgICAgICAgIGlzQ2xhc3NCYXNlZCA/IGNsYXNzZXNQbGF5ZXJCdWlsZGVySW5kZXggOiBzdHlsZXNQbGF5ZXJCdWlsZGVySW5kZXg7XG4gICAgICAgIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBjdHhJbmRleCwgcGxheWVyQnVpbGRlckluZGV4KTtcbiAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjdHhJbmRleCArPSBTdHlsaW5nSW5kZXguU2l6ZTtcbiAgfVxuXG4gIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGVyZSBhcmUgbGVmdC1vdmVyIHByb3BlcnRpZXMgaW4gdGhlIGNvbnRleHQgdGhhdFxuICAvLyB3ZXJlIG5vdCBkZXRlY3RlZCBpbiB0aGUgY29udGV4dCBkdXJpbmcgdGhlIGxvb3AgYWJvdmUuIEluIHRoYXRcbiAgLy8gY2FzZSB3ZSB3YW50IHRvIGFkZCB0aGUgbmV3IGVudHJpZXMgaW50byB0aGUgbGlzdFxuICBjb25zdCBzYW5pdGl6ZXIgPSBnZXRTdHlsZVNhbml0aXplcihjb250ZXh0KTtcbiAgd2hpbGUgKHByb3BJbmRleCA8IHByb3BMaW1pdCkge1xuICAgIGNvbnN0IGlzQ2xhc3NCYXNlZCA9IHByb3BJbmRleCA+PSBjbGFzc2VzU3RhcnRJbmRleDtcbiAgICBjb25zdCBwcm9jZXNzVmFsdWUgPVxuICAgICAgICAoIWlzQ2xhc3NCYXNlZCAmJiAhaWdub3JlQWxsU3R5bGVVcGRhdGVzKSB8fCAoaXNDbGFzc0Jhc2VkICYmICFpZ25vcmVBbGxDbGFzc1VwZGF0ZXMpO1xuICAgIGlmIChwcm9jZXNzVmFsdWUpIHtcbiAgICAgIGNvbnN0IGFkanVzdGVkUHJvcEluZGV4ID0gaXNDbGFzc0Jhc2VkID8gcHJvcEluZGV4IC0gY2xhc3Nlc1N0YXJ0SW5kZXggOiBwcm9wSW5kZXg7XG4gICAgICBjb25zdCBwcm9wID0gaXNDbGFzc0Jhc2VkID8gY2xhc3NOYW1lc1thZGp1c3RlZFByb3BJbmRleF0gOiBzdHlsZVByb3BzW2FkanVzdGVkUHJvcEluZGV4XTtcbiAgICAgIGNvbnN0IHZhbHVlOiBzdHJpbmd8Ym9vbGVhbiA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gKGFwcGx5QWxsQ2xhc3NlcyA/IHRydWUgOiBjbGFzc2VzW3Byb3BdKSA6IHN0eWxlc1twcm9wXTtcbiAgICAgIGNvbnN0IGZsYWcgPSBwcmVwYXJlSW5pdGlhbEZsYWcocHJvcCwgaXNDbGFzc0Jhc2VkLCBzYW5pdGl6ZXIpIHwgU3R5bGluZ0ZsYWdzLkRpcnR5O1xuICAgICAgY29uc3QgcGxheWVyQnVpbGRlckluZGV4ID1cbiAgICAgICAgICBpc0NsYXNzQmFzZWQgPyBjbGFzc2VzUGxheWVyQnVpbGRlckluZGV4IDogc3R5bGVzUGxheWVyQnVpbGRlckluZGV4O1xuICAgICAgY29udGV4dC5wdXNoKGZsYWcsIHByb3AsIHZhbHVlLCBwbGF5ZXJCdWlsZGVySW5kZXgpO1xuICAgICAgZGlydHkgPSB0cnVlO1xuICAgIH1cbiAgICBwcm9wSW5kZXgrKztcbiAgfVxuXG4gIGlmIChkaXJ0eSkge1xuICAgIHNldENvbnRleHREaXJ0eShjb250ZXh0LCB0cnVlKTtcbiAgfVxuXG4gIGlmIChwbGF5ZXJCdWlsZGVyc0FyZURpcnR5KSB7XG4gICAgc2V0Q29udGV4dFBsYXllcnNEaXJ0eShjb250ZXh0LCB0cnVlKTtcbiAgfVxufVxuXG4vKipcbiAqIFNldHMgYW5kIHJlc29sdmVzIGEgc2luZ2xlIHN0eWxpbmcgcHJvcGVydHkvdmFsdWUgb24gdGhlIHByb3ZpZGVkIGBTdHlsaW5nQ29udGV4dGAgc29cbiAqIHRoYXQgdGhleSBjYW4gYmUgYXBwbGllZCB0byB0aGUgZWxlbWVudCBvbmNlIGByZW5kZXJTdHlsZUFuZENsYXNzQmluZGluZ3NgIGlzIGNhbGxlZC5cbiAqXG4gKiBOb3RlIHRoYXQgcHJvcC1sZXZlbCBzdHlsaW5nIHZhbHVlcyBhcmUgY29uc2lkZXJlZCBoaWdoZXIgcHJpb3JpdHkgdGhhbiBhbnkgc3R5bGluZyB0aGF0XG4gKiBoYXMgYmVlbiBhcHBsaWVkIHVzaW5nIGB1cGRhdGVTdHlsaW5nTWFwYCwgdGhlcmVmb3JlLCB3aGVuIHN0eWxpbmcgdmFsdWVzIGFyZSByZW5kZXJlZFxuICogdGhlbiBhbnkgc3R5bGVzL2NsYXNzZXMgdGhhdCBoYXZlIGJlZW4gYXBwbGllZCB1c2luZyB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgY29uc2lkZXJlZCBmaXJzdFxuICogKHRoZW4gbXVsdGkgdmFsdWVzIHNlY29uZCBhbmQgdGhlbiBpbml0aWFsIHZhbHVlcyBhcyBhIGJhY2t1cCkuXG4gKlxuICogQHBhcmFtIGNvbnRleHQgVGhlIHN0eWxpbmcgY29udGV4dCB0aGF0IHdpbGwgYmUgdXBkYXRlZCB3aXRoIHRoZVxuICogICAgbmV3bHkgcHJvdmlkZWQgc3R5bGUgdmFsdWUuXG4gKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBwcm9wZXJ0eSB3aGljaCBpcyBiZWluZyB1cGRhdGVkLlxuICogQHBhcmFtIHZhbHVlIFRoZSBDU1Mgc3R5bGUgdmFsdWUgdGhhdCB3aWxsIGJlIGFzc2lnbmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTdHlsZVByb3AoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIsXG4gICAgaW5wdXQ6IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHwgQm91bmRQbGF5ZXJGYWN0b3J5PHN0cmluZ3xib29sZWFufG51bGw+KTogdm9pZCB7XG4gIGNvbnN0IHNpbmdsZUluZGV4ID0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb24gKyBpbmRleCAqIFN0eWxpbmdJbmRleC5TaXplO1xuICBjb25zdCBjdXJyVmFsdWUgPSBnZXRWYWx1ZShjb250ZXh0LCBzaW5nbGVJbmRleCk7XG4gIGNvbnN0IGN1cnJGbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgc2luZ2xlSW5kZXgpO1xuICBjb25zdCB2YWx1ZTogc3RyaW5nfGJvb2xlYW58bnVsbCA9IChpbnB1dCBpbnN0YW5jZW9mIEJvdW5kUGxheWVyRmFjdG9yeSkgPyBpbnB1dC52YWx1ZSA6IGlucHV0O1xuXG4gIC8vIGRpZG4ndCBjaGFuZ2UgLi4uIG5vdGhpbmcgdG8gbWFrZSBhIG5vdGUgb2ZcbiAgaWYgKGhhc1ZhbHVlQ2hhbmdlZChjdXJyRmxhZywgY3VyclZhbHVlLCB2YWx1ZSkpIHtcbiAgICBjb25zdCBpc0NsYXNzQmFzZWQgPSAoY3VyckZsYWcgJiBTdHlsaW5nRmxhZ3MuQ2xhc3MpID09PSBTdHlsaW5nRmxhZ3MuQ2xhc3M7XG4gICAgY29uc3QgZWxlbWVudCA9IGNvbnRleHRbU3R5bGluZ0luZGV4LkVsZW1lbnRQb3NpdGlvbl0gIWFzIEhUTUxFbGVtZW50O1xuICAgIGNvbnN0IHBsYXllckJ1aWxkZXIgPSBpbnB1dCBpbnN0YW5jZW9mIEJvdW5kUGxheWVyRmFjdG9yeSA/XG4gICAgICAgIG5ldyBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcihcbiAgICAgICAgICAgIGlucHV0IGFzIGFueSwgZWxlbWVudCwgaXNDbGFzc0Jhc2VkID8gQmluZGluZ1R5cGUuQ2xhc3MgOiBCaW5kaW5nVHlwZS5TdHlsZSkgOlxuICAgICAgICBudWxsO1xuICAgIGNvbnN0IHZhbHVlID0gKHBsYXllckJ1aWxkZXIgPyAoaW5wdXQgYXMgQm91bmRQbGF5ZXJGYWN0b3J5PGFueT4pLnZhbHVlIDogaW5wdXQpIGFzIHN0cmluZyB8XG4gICAgICAgIGJvb2xlYW4gfCBudWxsO1xuICAgIGNvbnN0IGN1cnJQbGF5ZXJJbmRleCA9IGdldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBzaW5nbGVJbmRleCk7XG5cbiAgICBsZXQgcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSA9IGZhbHNlO1xuICAgIGxldCBwbGF5ZXJCdWlsZGVySW5kZXggPSBwbGF5ZXJCdWlsZGVyID8gY3VyclBsYXllckluZGV4IDogMDtcbiAgICBpZiAoaGFzUGxheWVyQnVpbGRlckNoYW5nZWQoY29udGV4dCwgcGxheWVyQnVpbGRlciwgY3VyclBsYXllckluZGV4KSkge1xuICAgICAgY29uc3QgbmV3SW5kZXggPSBzZXRQbGF5ZXJCdWlsZGVyKGNvbnRleHQsIHBsYXllckJ1aWxkZXIsIGN1cnJQbGF5ZXJJbmRleCk7XG4gICAgICBwbGF5ZXJCdWlsZGVySW5kZXggPSBwbGF5ZXJCdWlsZGVyID8gbmV3SW5kZXggOiAwO1xuICAgICAgc2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIHNpbmdsZUluZGV4LCBwbGF5ZXJCdWlsZGVySW5kZXgpO1xuICAgICAgcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gdGhlIHZhbHVlIHdpbGwgYWx3YXlzIGdldCB1cGRhdGVkIChldmVuIGlmIHRoZSBkaXJ0eSBmbGFnIGlzIHNraXBwZWQpXG4gICAgc2V0VmFsdWUoY29udGV4dCwgc2luZ2xlSW5kZXgsIHZhbHVlKTtcbiAgICBjb25zdCBpbmRleEZvck11bHRpID0gZ2V0TXVsdGlPclNpbmdsZUluZGV4KGN1cnJGbGFnKTtcblxuICAgIC8vIGlmIHRoZSB2YWx1ZSBpcyB0aGUgc2FtZSBpbiB0aGUgbXVsdGktYXJlYSB0aGVuIHRoZXJlJ3Mgbm8gcG9pbnQgaW4gcmUtYXNzZW1ibGluZ1xuICAgIGNvbnN0IHZhbHVlRm9yTXVsdGkgPSBnZXRWYWx1ZShjb250ZXh0LCBpbmRleEZvck11bHRpKTtcbiAgICBpZiAoIXZhbHVlRm9yTXVsdGkgfHwgaGFzVmFsdWVDaGFuZ2VkKGN1cnJGbGFnLCB2YWx1ZUZvck11bHRpLCB2YWx1ZSkpIHtcbiAgICAgIGxldCBtdWx0aURpcnR5ID0gZmFsc2U7XG4gICAgICBsZXQgc2luZ2xlRGlydHkgPSB0cnVlO1xuXG4gICAgICAvLyBvbmx5IHdoZW4gdGhlIHZhbHVlIGlzIHNldCB0byBgbnVsbGAgc2hvdWxkIHRoZSBtdWx0aS12YWx1ZSBnZXQgZmxhZ2dlZFxuICAgICAgaWYgKCF2YWx1ZUV4aXN0cyh2YWx1ZSwgaXNDbGFzc0Jhc2VkKSAmJiB2YWx1ZUV4aXN0cyh2YWx1ZUZvck11bHRpLCBpc0NsYXNzQmFzZWQpKSB7XG4gICAgICAgIG11bHRpRGlydHkgPSB0cnVlO1xuICAgICAgICBzaW5nbGVEaXJ0eSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBzZXREaXJ0eShjb250ZXh0LCBpbmRleEZvck11bHRpLCBtdWx0aURpcnR5KTtcbiAgICAgIHNldERpcnR5KGNvbnRleHQsIHNpbmdsZUluZGV4LCBzaW5nbGVEaXJ0eSk7XG4gICAgICBzZXRDb250ZXh0RGlydHkoY29udGV4dCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHBsYXllckJ1aWxkZXJzQXJlRGlydHkpIHtcbiAgICAgIHNldENvbnRleHRQbGF5ZXJzRGlydHkoY29udGV4dCwgdHJ1ZSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2Qgd2lsbCB0b2dnbGUgdGhlIHJlZmVyZW5jZWQgQ1NTIGNsYXNzIChieSB0aGUgcHJvdmlkZWQgaW5kZXgpXG4gKiB3aXRoaW4gdGhlIGdpdmVuIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIGNvbnRleHQgVGhlIHN0eWxpbmcgY29udGV4dCB0aGF0IHdpbGwgYmUgdXBkYXRlZCB3aXRoIHRoZVxuICogICAgbmV3bHkgcHJvdmlkZWQgY2xhc3MgdmFsdWUuXG4gKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBDU1MgY2xhc3Mgd2hpY2ggaXMgYmVpbmcgdXBkYXRlZC5cbiAqIEBwYXJhbSBhZGRPclJlbW92ZSBXaGV0aGVyIG9yIG5vdCB0byBhZGQgb3IgcmVtb3ZlIHRoZSBDU1MgY2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUNsYXNzUHJvcChcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcixcbiAgICBhZGRPclJlbW92ZTogYm9vbGVhbiB8IEJvdW5kUGxheWVyRmFjdG9yeTxib29sZWFuPik6IHZvaWQge1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID0gaW5kZXggKyBjb250ZXh0W1N0eWxpbmdJbmRleC5DbGFzc09mZnNldFBvc2l0aW9uXTtcbiAgdXBkYXRlU3R5bGVQcm9wKGNvbnRleHQsIGFkanVzdGVkSW5kZXgsIGFkZE9yUmVtb3ZlKTtcbn1cblxuLyoqXG4gKiBSZW5kZXJzIGFsbCBxdWV1ZWQgc3R5bGluZyB1c2luZyBhIHJlbmRlcmVyIG9udG8gdGhlIGdpdmVuIGVsZW1lbnQuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3b3JrcyBieSByZW5kZXJpbmcgYW55IHN0eWxlcyAodGhhdCBoYXZlIGJlZW4gYXBwbGllZFxuICogdXNpbmcgYHVwZGF0ZVN0eWxpbmdNYXBgKSBhbmQgYW55IGNsYXNzZXMgKHRoYXQgaGF2ZSBiZWVuIGFwcGxpZWQgdXNpbmdcbiAqIGB1cGRhdGVTdHlsZVByb3BgKSBvbnRvIHRoZSBwcm92aWRlZCBlbGVtZW50IHVzaW5nIHRoZSBwcm92aWRlZCByZW5kZXJlci5cbiAqIEp1c3QgYmVmb3JlIHRoZSBzdHlsZXMvY2xhc3NlcyBhcmUgcmVuZGVyZWQgYSBmaW5hbCBrZXkvdmFsdWUgc3R5bGUgbWFwXG4gKiB3aWxsIGJlIGFzc2VtYmxlZCAoaWYgYHN0eWxlU3RvcmVgIG9yIGBjbGFzc1N0b3JlYCBhcmUgcHJvdmlkZWQpLlxuICpcbiAqIEBwYXJhbSBsRWxlbWVudCB0aGUgZWxlbWVudCB0aGF0IHRoZSBzdHlsZXMgd2lsbCBiZSByZW5kZXJlZCBvblxuICogQHBhcmFtIGNvbnRleHQgVGhlIHN0eWxpbmcgY29udGV4dCB0aGF0IHdpbGwgYmUgdXNlZCB0byBkZXRlcm1pbmVcbiAqICAgICAgd2hhdCBzdHlsZXMgd2lsbCBiZSByZW5kZXJlZFxuICogQHBhcmFtIHJlbmRlcmVyIHRoZSByZW5kZXJlciB0aGF0IHdpbGwgYmUgdXNlZCB0byBhcHBseSB0aGUgc3R5bGluZ1xuICogQHBhcmFtIGNsYXNzZXNTdG9yZSBpZiBwcm92aWRlZCwgdGhlIHVwZGF0ZWQgY2xhc3MgdmFsdWVzIHdpbGwgYmUgYXBwbGllZFxuICogICAgdG8gdGhpcyBrZXkvdmFsdWUgbWFwIGluc3RlYWQgb2YgYmVpbmcgcmVuZGVyZXJlZCB2aWEgdGhlIHJlbmRlcmVyLlxuICogQHBhcmFtIHN0eWxlc1N0b3JlIGlmIHByb3ZpZGVkLCB0aGUgdXBkYXRlZCBzdHlsZSB2YWx1ZXMgd2lsbCBiZSBhcHBsaWVkXG4gKiAgICB0byB0aGlzIGtleS92YWx1ZSBtYXAgaW5zdGVhZCBvZiBiZWluZyByZW5kZXJlcmVkIHZpYSB0aGUgcmVuZGVyZXIuXG4gKiBAcmV0dXJucyBudW1iZXIgdGhlIHRvdGFsIGFtb3VudCBvZiBwbGF5ZXJzIHRoYXQgZ290IHF1ZXVlZCBmb3IgYW5pbWF0aW9uIChpZiBhbnkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTdHlsZUFuZENsYXNzQmluZGluZ3MoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIHJlbmRlcmVyOiBSZW5kZXJlcjMsIHJvb3RPclZpZXc6IFJvb3RDb250ZXh0IHwgTFZpZXdEYXRhLFxuICAgIGNsYXNzZXNTdG9yZT86IEJpbmRpbmdTdG9yZSB8IG51bGwsIHN0eWxlc1N0b3JlPzogQmluZGluZ1N0b3JlIHwgbnVsbCk6IG51bWJlciB7XG4gIGxldCB0b3RhbFBsYXllcnNRdWV1ZWQgPSAwO1xuICBpZiAoaXNDb250ZXh0RGlydHkoY29udGV4dCkpIHtcbiAgICBjb25zdCBmbHVzaFBsYXllckJ1aWxkZXJzOiBhbnkgPVxuICAgICAgICBjb250ZXh0W1N0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb25dICYgU3R5bGluZ0ZsYWdzLlBsYXllckJ1aWxkZXJzRGlydHk7XG4gICAgY29uc3QgbmF0aXZlID0gY29udGV4dFtTdHlsaW5nSW5kZXguRWxlbWVudFBvc2l0aW9uXSAhO1xuICAgIGNvbnN0IG11bHRpU3RhcnRJbmRleCA9IGdldE11bHRpU3RhcnRJbmRleChjb250ZXh0KTtcbiAgICBjb25zdCBzdHlsZVNhbml0aXplciA9IGdldFN0eWxlU2FuaXRpemVyKGNvbnRleHQpO1xuICAgIGZvciAobGV0IGkgPSBTdHlsaW5nSW5kZXguU2luZ2xlU3R5bGVzU3RhcnRQb3NpdGlvbjsgaSA8IGNvbnRleHQubGVuZ3RoO1xuICAgICAgICAgaSArPSBTdHlsaW5nSW5kZXguU2l6ZSkge1xuICAgICAgLy8gdGhlcmUgaXMgbm8gcG9pbnQgaW4gcmVuZGVyaW5nIHN0eWxlcyB0aGF0IGhhdmUgbm90IGNoYW5nZWQgb24gc2NyZWVuXG4gICAgICBpZiAoaXNEaXJ0eShjb250ZXh0LCBpKSkge1xuICAgICAgICBjb25zdCBwcm9wID0gZ2V0UHJvcChjb250ZXh0LCBpKTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRWYWx1ZShjb250ZXh0LCBpKTtcbiAgICAgICAgY29uc3QgZmxhZyA9IGdldFBvaW50ZXJzKGNvbnRleHQsIGkpO1xuICAgICAgICBjb25zdCBwbGF5ZXJCdWlsZGVyID0gZ2V0UGxheWVyQnVpbGRlcihjb250ZXh0LCBpKTtcbiAgICAgICAgY29uc3QgaXNDbGFzc0Jhc2VkID0gZmxhZyAmIFN0eWxpbmdGbGFncy5DbGFzcyA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgY29uc3QgaXNJblNpbmdsZVJlZ2lvbiA9IGkgPCBtdWx0aVN0YXJ0SW5kZXg7XG5cbiAgICAgICAgbGV0IHZhbHVlVG9BcHBseTogc3RyaW5nfGJvb2xlYW58bnVsbCA9IHZhbHVlO1xuXG4gICAgICAgIC8vIFZBTFVFIERFRkVSIENBU0UgMTogVXNlIGEgbXVsdGkgdmFsdWUgaW5zdGVhZCBvZiBhIG51bGwgc2luZ2xlIHZhbHVlXG4gICAgICAgIC8vIHRoaXMgY2hlY2sgaW1wbGllcyB0aGF0IGEgc2luZ2xlIHZhbHVlIHdhcyByZW1vdmVkIGFuZCB3ZVxuICAgICAgICAvLyBzaG91bGQgbm93IGRlZmVyIHRvIGEgbXVsdGkgdmFsdWUgYW5kIHVzZSB0aGF0IChpZiBzZXQpLlxuICAgICAgICBpZiAoaXNJblNpbmdsZVJlZ2lvbiAmJiAhdmFsdWVFeGlzdHModmFsdWVUb0FwcGx5LCBpc0NsYXNzQmFzZWQpKSB7XG4gICAgICAgICAgLy8gc2luZ2xlIHZhbHVlcyBBTFdBWVMgaGF2ZSBhIHJlZmVyZW5jZSB0byBhIG11bHRpIGluZGV4XG4gICAgICAgICAgY29uc3QgbXVsdGlJbmRleCA9IGdldE11bHRpT3JTaW5nbGVJbmRleChmbGFnKTtcbiAgICAgICAgICB2YWx1ZVRvQXBwbHkgPSBnZXRWYWx1ZShjb250ZXh0LCBtdWx0aUluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZBTFVFIERFRkVSIENBU0UgMjogVXNlIHRoZSBpbml0aWFsIHZhbHVlIGlmIGFsbCBlbHNlIGZhaWxzIChpcyBmYWxzeSlcbiAgICAgICAgLy8gdGhlIGluaXRpYWwgdmFsdWUgd2lsbCBhbHdheXMgYmUgYSBzdHJpbmcgb3IgbnVsbCxcbiAgICAgICAgLy8gdGhlcmVmb3JlIHdlIGNhbiBzYWZlbHkgYWRvcHQgaXQgaW5jYXNlIHRoZXJlJ3Mgbm90aGluZyBlbHNlXG4gICAgICAgIC8vIG5vdGUgdGhhdCB0aGlzIHNob3VsZCBhbHdheXMgYmUgYSBmYWxzeSBjaGVjayBzaW5jZSBgZmFsc2VgIGlzIHVzZWRcbiAgICAgICAgLy8gZm9yIGJvdGggY2xhc3MgYW5kIHN0eWxlIGNvbXBhcmlzb25zIChzdHlsZXMgY2FuJ3QgYmUgZmFsc2UgYW5kIGZhbHNlXG4gICAgICAgIC8vIGNsYXNzZXMgYXJlIHR1cm5lZCBvZmYgYW5kIHNob3VsZCB0aGVyZWZvcmUgZGVmZXIgdG8gdGhlaXIgaW5pdGlhbCB2YWx1ZXMpXG4gICAgICAgIGlmICghdmFsdWVFeGlzdHModmFsdWVUb0FwcGx5LCBpc0NsYXNzQmFzZWQpKSB7XG4gICAgICAgICAgdmFsdWVUb0FwcGx5ID0gZ2V0SW5pdGlhbFZhbHVlKGNvbnRleHQsIGZsYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQ2xhc3NCYXNlZCkge1xuICAgICAgICAgIHNldENsYXNzKFxuICAgICAgICAgICAgICBuYXRpdmUsIHByb3AsIHZhbHVlVG9BcHBseSA/IHRydWUgOiBmYWxzZSwgcmVuZGVyZXIsIGNsYXNzZXNTdG9yZSwgcGxheWVyQnVpbGRlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc2FuaXRpemVyID0gKGZsYWcgJiBTdHlsaW5nRmxhZ3MuU2FuaXRpemUpID8gc3R5bGVTYW5pdGl6ZXIgOiBudWxsO1xuICAgICAgICAgIHNldFN0eWxlKFxuICAgICAgICAgICAgICBuYXRpdmUsIHByb3AsIHZhbHVlVG9BcHBseSBhcyBzdHJpbmcgfCBudWxsLCByZW5kZXJlciwgc2FuaXRpemVyLCBzdHlsZXNTdG9yZSxcbiAgICAgICAgICAgICAgcGxheWVyQnVpbGRlcik7XG4gICAgICAgIH1cbiAgICAgICAgc2V0RGlydHkoY29udGV4dCwgaSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmbHVzaFBsYXllckJ1aWxkZXJzKSB7XG4gICAgICBjb25zdCByb290Q29udGV4dCA9XG4gICAgICAgICAgQXJyYXkuaXNBcnJheShyb290T3JWaWV3KSA/IGdldFJvb3RDb250ZXh0KHJvb3RPclZpZXcpIDogcm9vdE9yVmlldyBhcyBSb290Q29udGV4dDtcbiAgICAgIGNvbnN0IHBsYXllckNvbnRleHQgPSBnZXRQbGF5ZXJDb250ZXh0KGNvbnRleHQpICE7XG4gICAgICBjb25zdCBwbGF5ZXJzU3RhcnRJbmRleCA9IHBsYXllckNvbnRleHRbUGxheWVySW5kZXguTm9uQnVpbGRlclBsYXllcnNTdGFydF07XG4gICAgICBmb3IgKGxldCBpID0gUGxheWVySW5kZXguUGxheWVyQnVpbGRlcnNTdGFydFBvc2l0aW9uOyBpIDwgcGxheWVyc1N0YXJ0SW5kZXg7XG4gICAgICAgICAgIGkgKz0gUGxheWVySW5kZXguUGxheWVyQW5kUGxheWVyQnVpbGRlcnNUdXBsZVNpemUpIHtcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IHBsYXllckNvbnRleHRbaV0gYXMgQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXI8YW55PnwgbnVsbDtcbiAgICAgICAgY29uc3QgcGxheWVySW5zZXJ0aW9uSW5kZXggPSBpICsgUGxheWVySW5kZXguUGxheWVyT2Zmc2V0UG9zaXRpb247XG4gICAgICAgIGNvbnN0IG9sZFBsYXllciA9IHBsYXllckNvbnRleHRbcGxheWVySW5zZXJ0aW9uSW5kZXhdIGFzIFBsYXllciB8IG51bGw7XG4gICAgICAgIGlmIChidWlsZGVyKSB7XG4gICAgICAgICAgY29uc3QgcGxheWVyID0gYnVpbGRlci5idWlsZFBsYXllcihvbGRQbGF5ZXIpO1xuICAgICAgICAgIGlmIChwbGF5ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHBsYXllciAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdhc1F1ZXVlZCA9IGFkZFBsYXllckludGVybmFsKFxuICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGV4dCwgcm9vdENvbnRleHQsIG5hdGl2ZSBhcyBIVE1MRWxlbWVudCwgcGxheWVyLCBwbGF5ZXJJbnNlcnRpb25JbmRleCk7XG4gICAgICAgICAgICAgIHdhc1F1ZXVlZCAmJiB0b3RhbFBsYXllcnNRdWV1ZWQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvbGRQbGF5ZXIpIHtcbiAgICAgICAgICAgICAgb2xkUGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAob2xkUGxheWVyKSB7XG4gICAgICAgICAgLy8gdGhlIHBsYXllciBidWlsZGVyIGhhcyBiZWVuIHJlbW92ZWQgLi4uIHRoZXJlZm9yZSB3ZSBzaG91bGQgZGVsZXRlIHRoZSBhc3NvY2lhdGVkXG4gICAgICAgICAgLy8gcGxheWVyXG4gICAgICAgICAgb2xkUGxheWVyLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2V0Q29udGV4dFBsYXllcnNEaXJ0eShjb250ZXh0LCBmYWxzZSk7XG4gICAgfVxuICAgIHNldENvbnRleHREaXJ0eShjb250ZXh0LCBmYWxzZSk7XG4gIH1cblxuICByZXR1cm4gdG90YWxQbGF5ZXJzUXVldWVkO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmVuZGVycyBhIGdpdmVuIENTUyBwcm9wL3ZhbHVlIGVudHJ5IHVzaW5nIHRoZVxuICogcHJvdmlkZWQgcmVuZGVyZXIuIElmIGEgYHN0b3JlYCB2YWx1ZSBpcyBwcm92aWRlZCB0aGVuXG4gKiB0aGF0IHdpbGwgYmUgdXNlZCBhIHJlbmRlciBjb250ZXh0IGluc3RlYWQgb2YgdGhlIHByb3ZpZGVkXG4gKiByZW5kZXJlci5cbiAqXG4gKiBAcGFyYW0gbmF0aXZlIHRoZSBET00gRWxlbWVudFxuICogQHBhcmFtIHByb3AgdGhlIENTUyBzdHlsZSBwcm9wZXJ0eSB0aGF0IHdpbGwgYmUgcmVuZGVyZWRcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgQ1NTIHN0eWxlIHZhbHVlIHRoYXQgd2lsbCBiZSByZW5kZXJlZFxuICogQHBhcmFtIHJlbmRlcmVyXG4gKiBAcGFyYW0gc3RvcmUgYW4gb3B0aW9uYWwga2V5L3ZhbHVlIG1hcCB0aGF0IHdpbGwgYmUgdXNlZCBhcyBhIGNvbnRleHQgdG8gcmVuZGVyIHN0eWxlcyBvblxuICovXG5mdW5jdGlvbiBzZXRTdHlsZShcbiAgICBuYXRpdmU6IGFueSwgcHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgbnVsbCwgcmVuZGVyZXI6IFJlbmRlcmVyMyxcbiAgICBzYW5pdGl6ZXI6IFN0eWxlU2FuaXRpemVGbiB8IG51bGwsIHN0b3JlPzogQmluZGluZ1N0b3JlIHwgbnVsbCxcbiAgICBwbGF5ZXJCdWlsZGVyPzogQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXI8YW55PnwgbnVsbCkge1xuICB2YWx1ZSA9IHNhbml0aXplciAmJiB2YWx1ZSA/IHNhbml0aXplcihwcm9wLCB2YWx1ZSkgOiB2YWx1ZTtcbiAgaWYgKHN0b3JlIHx8IHBsYXllckJ1aWxkZXIpIHtcbiAgICBpZiAoc3RvcmUpIHtcbiAgICAgIHN0b3JlLnNldFZhbHVlKHByb3AsIHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKHBsYXllckJ1aWxkZXIpIHtcbiAgICAgIHBsYXllckJ1aWxkZXIuc2V0VmFsdWUocHJvcCwgdmFsdWUpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJTZXRTdHlsZSsrO1xuICAgIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/XG4gICAgICAgIHJlbmRlcmVyLnNldFN0eWxlKG5hdGl2ZSwgcHJvcCwgdmFsdWUsIFJlbmRlcmVyU3R5bGVGbGFnczMuRGFzaENhc2UpIDpcbiAgICAgICAgbmF0aXZlWydzdHlsZSddLnNldFByb3BlcnR5KHByb3AsIHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyUmVtb3ZlU3R5bGUrKztcbiAgICBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgP1xuICAgICAgICByZW5kZXJlci5yZW1vdmVTdHlsZShuYXRpdmUsIHByb3AsIFJlbmRlcmVyU3R5bGVGbGFnczMuRGFzaENhc2UpIDpcbiAgICAgICAgbmF0aXZlWydzdHlsZSddLnJlbW92ZVByb3BlcnR5KHByb3ApO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZW5kZXJzIGEgZ2l2ZW4gQ1NTIGNsYXNzIHZhbHVlIHVzaW5nIHRoZSBwcm92aWRlZFxuICogcmVuZGVyZXIgKGJ5IGFkZGluZyBvciByZW1vdmluZyBpdCBmcm9tIHRoZSBwcm92aWRlZCBlbGVtZW50KS5cbiAqIElmIGEgYHN0b3JlYCB2YWx1ZSBpcyBwcm92aWRlZCB0aGVuIHRoYXQgd2lsbCBiZSB1c2VkIGEgcmVuZGVyXG4gKiBjb250ZXh0IGluc3RlYWQgb2YgdGhlIHByb3ZpZGVkIHJlbmRlcmVyLlxuICpcbiAqIEBwYXJhbSBuYXRpdmUgdGhlIERPTSBFbGVtZW50XG4gKiBAcGFyYW0gcHJvcCB0aGUgQ1NTIHN0eWxlIHByb3BlcnR5IHRoYXQgd2lsbCBiZSByZW5kZXJlZFxuICogQHBhcmFtIHZhbHVlIHRoZSBDU1Mgc3R5bGUgdmFsdWUgdGhhdCB3aWxsIGJlIHJlbmRlcmVkXG4gKiBAcGFyYW0gcmVuZGVyZXJcbiAqIEBwYXJhbSBzdG9yZSBhbiBvcHRpb25hbCBrZXkvdmFsdWUgbWFwIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGEgY29udGV4dCB0byByZW5kZXIgc3R5bGVzIG9uXG4gKi9cbmZ1bmN0aW9uIHNldENsYXNzKFxuICAgIG5hdGl2ZTogYW55LCBjbGFzc05hbWU6IHN0cmluZywgYWRkOiBib29sZWFuLCByZW5kZXJlcjogUmVuZGVyZXIzLCBzdG9yZT86IEJpbmRpbmdTdG9yZSB8IG51bGwsXG4gICAgcGxheWVyQnVpbGRlcj86IENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyPGFueT58IG51bGwpIHtcbiAgaWYgKHN0b3JlIHx8IHBsYXllckJ1aWxkZXIpIHtcbiAgICBpZiAoc3RvcmUpIHtcbiAgICAgIHN0b3JlLnNldFZhbHVlKGNsYXNzTmFtZSwgYWRkKTtcbiAgICB9XG4gICAgaWYgKHBsYXllckJ1aWxkZXIpIHtcbiAgICAgIHBsYXllckJ1aWxkZXIuc2V0VmFsdWUoY2xhc3NOYW1lLCBhZGQpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChhZGQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyQWRkQ2xhc3MrKztcbiAgICBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgPyByZW5kZXJlci5hZGRDbGFzcyhuYXRpdmUsIGNsYXNzTmFtZSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdGl2ZVsnY2xhc3NMaXN0J10uYWRkKGNsYXNzTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlclJlbW92ZUNsYXNzKys7XG4gICAgaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpID8gcmVuZGVyZXIucmVtb3ZlQ2xhc3MobmF0aXZlLCBjbGFzc05hbWUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXRpdmVbJ2NsYXNzTGlzdCddLnJlbW92ZShjbGFzc05hbWUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldERpcnR5KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyLCBpc0RpcnR5WWVzOiBib29sZWFuKSB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPVxuICAgICAgaW5kZXggPj0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb24gPyAoaW5kZXggKyBTdHlsaW5nSW5kZXguRmxhZ3NPZmZzZXQpIDogaW5kZXg7XG4gIGlmIChpc0RpcnR5WWVzKSB7XG4gICAgKGNvbnRleHRbYWRqdXN0ZWRJbmRleF0gYXMgbnVtYmVyKSB8PSBTdHlsaW5nRmxhZ3MuRGlydHk7XG4gIH0gZWxzZSB7XG4gICAgKGNvbnRleHRbYWRqdXN0ZWRJbmRleF0gYXMgbnVtYmVyKSAmPSB+U3R5bGluZ0ZsYWdzLkRpcnR5O1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRGlydHkoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgY29uc3QgYWRqdXN0ZWRJbmRleCA9XG4gICAgICBpbmRleCA+PSBTdHlsaW5nSW5kZXguU2luZ2xlU3R5bGVzU3RhcnRQb3NpdGlvbiA/IChpbmRleCArIFN0eWxpbmdJbmRleC5GbGFnc09mZnNldCkgOiBpbmRleDtcbiAgcmV0dXJuICgoY29udGV4dFthZGp1c3RlZEluZGV4XSBhcyBudW1iZXIpICYgU3R5bGluZ0ZsYWdzLkRpcnR5KSA9PSBTdHlsaW5nRmxhZ3MuRGlydHk7XG59XG5cbmZ1bmN0aW9uIGlzQ2xhc3NCYXNlZChjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID1cbiAgICAgIGluZGV4ID49IFN0eWxpbmdJbmRleC5TaW5nbGVTdHlsZXNTdGFydFBvc2l0aW9uID8gKGluZGV4ICsgU3R5bGluZ0luZGV4LkZsYWdzT2Zmc2V0KSA6IGluZGV4O1xuICByZXR1cm4gKChjb250ZXh0W2FkanVzdGVkSW5kZXhdIGFzIG51bWJlcikgJiBTdHlsaW5nRmxhZ3MuQ2xhc3MpID09IFN0eWxpbmdGbGFncy5DbGFzcztcbn1cblxuZnVuY3Rpb24gaXNTYW5pdGl6YWJsZShjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID1cbiAgICAgIGluZGV4ID49IFN0eWxpbmdJbmRleC5TaW5nbGVTdHlsZXNTdGFydFBvc2l0aW9uID8gKGluZGV4ICsgU3R5bGluZ0luZGV4LkZsYWdzT2Zmc2V0KSA6IGluZGV4O1xuICByZXR1cm4gKChjb250ZXh0W2FkanVzdGVkSW5kZXhdIGFzIG51bWJlcikgJiBTdHlsaW5nRmxhZ3MuU2FuaXRpemUpID09IFN0eWxpbmdGbGFncy5TYW5pdGl6ZTtcbn1cblxuZnVuY3Rpb24gcG9pbnRlcnMoY29uZmlnRmxhZzogbnVtYmVyLCBzdGF0aWNJbmRleDogbnVtYmVyLCBkeW5hbWljSW5kZXg6IG51bWJlcikge1xuICByZXR1cm4gKGNvbmZpZ0ZsYWcgJiBTdHlsaW5nRmxhZ3MuQml0TWFzaykgfCAoc3RhdGljSW5kZXggPDwgU3R5bGluZ0ZsYWdzLkJpdENvdW50U2l6ZSkgfFxuICAgICAgKGR5bmFtaWNJbmRleCA8PCAoU3R5bGluZ0luZGV4LkJpdENvdW50U2l6ZSArIFN0eWxpbmdGbGFncy5CaXRDb3VudFNpemUpKTtcbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFZhbHVlKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBmbGFnOiBudW1iZXIpOiBzdHJpbmd8bnVsbCB7XG4gIGNvbnN0IGluZGV4ID0gZ2V0SW5pdGlhbEluZGV4KGZsYWcpO1xuICByZXR1cm4gY29udGV4dFtTdHlsaW5nSW5kZXguSW5pdGlhbFN0eWxlc1Bvc2l0aW9uXVtpbmRleF0gYXMgbnVsbCB8IHN0cmluZztcbn1cblxuZnVuY3Rpb24gZ2V0SW5pdGlhbEluZGV4KGZsYWc6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoZmxhZyA+PiBTdHlsaW5nRmxhZ3MuQml0Q291bnRTaXplKSAmIFN0eWxpbmdJbmRleC5CaXRNYXNrO1xufVxuXG5mdW5jdGlvbiBnZXRNdWx0aU9yU2luZ2xlSW5kZXgoZmxhZzogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgaW5kZXggPVxuICAgICAgKGZsYWcgPj4gKFN0eWxpbmdJbmRleC5CaXRDb3VudFNpemUgKyBTdHlsaW5nRmxhZ3MuQml0Q291bnRTaXplKSkgJiBTdHlsaW5nSW5kZXguQml0TWFzaztcbiAgcmV0dXJuIGluZGV4ID49IFN0eWxpbmdJbmRleC5TaW5nbGVTdHlsZXNTdGFydFBvc2l0aW9uID8gaW5kZXggOiAtMTtcbn1cblxuZnVuY3Rpb24gZ2V0TXVsdGlTdGFydEluZGV4KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0KTogbnVtYmVyIHtcbiAgcmV0dXJuIGdldE11bHRpT3JTaW5nbGVJbmRleChjb250ZXh0W1N0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb25dKSBhcyBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIGdldFN0eWxlU2FuaXRpemVyKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0KTogU3R5bGVTYW5pdGl6ZUZufG51bGwge1xuICByZXR1cm4gY29udGV4dFtTdHlsaW5nSW5kZXguU3R5bGVTYW5pdGl6ZXJQb3NpdGlvbl07XG59XG5cbmZ1bmN0aW9uIHNldFByb3AoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIsIHByb3A6IHN0cmluZykge1xuICBjb250ZXh0W2luZGV4ICsgU3R5bGluZ0luZGV4LlByb3BlcnR5T2Zmc2V0XSA9IHByb3A7XG59XG5cbmZ1bmN0aW9uIHNldFZhbHVlKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyLCB2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IGJvb2xlYW4pIHtcbiAgY29udGV4dFtpbmRleCArIFN0eWxpbmdJbmRleC5WYWx1ZU9mZnNldF0gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gaGFzUGxheWVyQnVpbGRlckNoYW5nZWQoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGJ1aWxkZXI6IENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyPGFueT58IG51bGwsIGluZGV4OiBudW1iZXIpIHtcbiAgY29uc3QgcGxheWVyQ29udGV4dCA9IGNvbnRleHRbU3R5bGluZ0luZGV4LlBsYXllckNvbnRleHRdICE7XG4gIGlmIChidWlsZGVyKSB7XG4gICAgaWYgKCFwbGF5ZXJDb250ZXh0IHx8IGluZGV4ID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIXBsYXllckNvbnRleHQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBsYXllckNvbnRleHRbaW5kZXhdICE9PSBidWlsZGVyO1xufVxuXG5mdW5jdGlvbiBzZXRQbGF5ZXJCdWlsZGVyKFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBidWlsZGVyOiBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxhbnk+fCBudWxsLFxuICAgIGluc2VydGlvbkluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgcGxheWVyQ29udGV4dCA9IGNvbnRleHRbU3R5bGluZ0luZGV4LlBsYXllckNvbnRleHRdIHx8IGFsbG9jUGxheWVyQ29udGV4dChjb250ZXh0KTtcbiAgaWYgKGluc2VydGlvbkluZGV4ID4gMCkge1xuICAgIHBsYXllckNvbnRleHRbaW5zZXJ0aW9uSW5kZXhdID0gYnVpbGRlcjtcbiAgfSBlbHNlIHtcbiAgICBpbnNlcnRpb25JbmRleCA9IHBsYXllckNvbnRleHRbUGxheWVySW5kZXguTm9uQnVpbGRlclBsYXllcnNTdGFydF07XG4gICAgcGxheWVyQ29udGV4dC5zcGxpY2UoaW5zZXJ0aW9uSW5kZXgsIDAsIGJ1aWxkZXIsIG51bGwpO1xuICAgIHBsYXllckNvbnRleHRbUGxheWVySW5kZXguTm9uQnVpbGRlclBsYXllcnNTdGFydF0gKz1cbiAgICAgICAgUGxheWVySW5kZXguUGxheWVyQW5kUGxheWVyQnVpbGRlcnNUdXBsZVNpemU7XG4gIH1cbiAgcmV0dXJuIGluc2VydGlvbkluZGV4O1xufVxuXG5mdW5jdGlvbiBzZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIsIHBsYXllckJ1aWxkZXJJbmRleDogbnVtYmVyKSB7XG4gIGNvbnRleHRbaW5kZXggKyBTdHlsaW5nSW5kZXguUGxheWVyQnVpbGRlckluZGV4T2Zmc2V0XSA9IHBsYXllckJ1aWxkZXJJbmRleDtcbn1cblxuZnVuY3Rpb24gZ2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChjb250ZXh0W2luZGV4ICsgU3R5bGluZ0luZGV4LlBsYXllckJ1aWxkZXJJbmRleE9mZnNldF0gYXMgbnVtYmVyKSB8fCAwO1xufVxuXG5mdW5jdGlvbiBnZXRQbGF5ZXJCdWlsZGVyKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyKTogQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXI8YW55PnxcbiAgICBudWxsIHtcbiAgY29uc3QgcGxheWVyQnVpbGRlckluZGV4ID0gZ2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIGluZGV4KTtcbiAgaWYgKHBsYXllckJ1aWxkZXJJbmRleCkge1xuICAgIGNvbnN0IHBsYXllckNvbnRleHQgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5QbGF5ZXJDb250ZXh0XTtcbiAgICBpZiAocGxheWVyQ29udGV4dCkge1xuICAgICAgcmV0dXJuIHBsYXllckNvbnRleHRbcGxheWVyQnVpbGRlckluZGV4XSBhcyBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxhbnk+fCBudWxsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gc2V0RmxhZyhjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlciwgZmxhZzogbnVtYmVyKSB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPVxuICAgICAgaW5kZXggPT09IFN0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb24gPyBpbmRleCA6IChpbmRleCArIFN0eWxpbmdJbmRleC5GbGFnc09mZnNldCk7XG4gIGNvbnRleHRbYWRqdXN0ZWRJbmRleF0gPSBmbGFnO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludGVycyhjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPVxuICAgICAgaW5kZXggPT09IFN0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb24gPyBpbmRleCA6IChpbmRleCArIFN0eWxpbmdJbmRleC5GbGFnc09mZnNldCk7XG4gIHJldHVybiBjb250ZXh0W2FkanVzdGVkSW5kZXhdIGFzIG51bWJlcjtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWUoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIpOiBzdHJpbmd8Ym9vbGVhbnxudWxsIHtcbiAgcmV0dXJuIGNvbnRleHRbaW5kZXggKyBTdHlsaW5nSW5kZXguVmFsdWVPZmZzZXRdIGFzIHN0cmluZyB8IGJvb2xlYW4gfCBudWxsO1xufVxuXG5mdW5jdGlvbiBnZXRQcm9wKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNvbnRleHRbaW5kZXggKyBTdHlsaW5nSW5kZXguUHJvcGVydHlPZmZzZXRdIGFzIHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29udGV4dERpcnR5KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0RpcnR5KGNvbnRleHQsIFN0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29udGV4dERpcnR5KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpc0RpcnR5WWVzOiBib29sZWFuKTogdm9pZCB7XG4gIHNldERpcnR5KGNvbnRleHQsIFN0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb24sIGlzRGlydHlZZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29udGV4dFBsYXllcnNEaXJ0eShjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaXNEaXJ0eVllczogYm9vbGVhbik6IHZvaWQge1xuICBpZiAoaXNEaXJ0eVllcykge1xuICAgIChjb250ZXh0W1N0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb25dIGFzIG51bWJlcikgfD0gU3R5bGluZ0ZsYWdzLlBsYXllckJ1aWxkZXJzRGlydHk7XG4gIH0gZWxzZSB7XG4gICAgKGNvbnRleHRbU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbl0gYXMgbnVtYmVyKSAmPSB+U3R5bGluZ0ZsYWdzLlBsYXllckJ1aWxkZXJzRGlydHk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZEVudHJ5UG9zaXRpb25CeVByb3AoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIHByb3A6IHN0cmluZywgc3RhcnRJbmRleD86IG51bWJlcik6IG51bWJlciB7XG4gIGZvciAobGV0IGkgPSAoc3RhcnRJbmRleCB8fCAwKSArIFN0eWxpbmdJbmRleC5Qcm9wZXJ0eU9mZnNldDsgaSA8IGNvbnRleHQubGVuZ3RoO1xuICAgICAgIGkgKz0gU3R5bGluZ0luZGV4LlNpemUpIHtcbiAgICBjb25zdCB0aGlzUHJvcCA9IGNvbnRleHRbaV07XG4gICAgaWYgKHRoaXNQcm9wID09IHByb3ApIHtcbiAgICAgIHJldHVybiBpIC0gU3R5bGluZ0luZGV4LlByb3BlcnR5T2Zmc2V0O1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIHN3YXBNdWx0aUNvbnRleHRFbnRyaWVzKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleEE6IG51bWJlciwgaW5kZXhCOiBudW1iZXIpIHtcbiAgY29uc3QgdG1wVmFsdWUgPSBnZXRWYWx1ZShjb250ZXh0LCBpbmRleEEpO1xuICBjb25zdCB0bXBQcm9wID0gZ2V0UHJvcChjb250ZXh0LCBpbmRleEEpO1xuICBjb25zdCB0bXBGbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgaW5kZXhBKTtcbiAgY29uc3QgdG1wUGxheWVyQnVpbGRlckluZGV4ID0gZ2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIGluZGV4QSk7XG5cbiAgbGV0IGZsYWdBID0gdG1wRmxhZztcbiAgbGV0IGZsYWdCID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgaW5kZXhCKTtcblxuICBjb25zdCBzaW5nbGVJbmRleEEgPSBnZXRNdWx0aU9yU2luZ2xlSW5kZXgoZmxhZ0EpO1xuICBpZiAoc2luZ2xlSW5kZXhBID49IDApIHtcbiAgICBjb25zdCBfZmxhZyA9IGdldFBvaW50ZXJzKGNvbnRleHQsIHNpbmdsZUluZGV4QSk7XG4gICAgY29uc3QgX2luaXRpYWwgPSBnZXRJbml0aWFsSW5kZXgoX2ZsYWcpO1xuICAgIHNldEZsYWcoY29udGV4dCwgc2luZ2xlSW5kZXhBLCBwb2ludGVycyhfZmxhZywgX2luaXRpYWwsIGluZGV4QikpO1xuICB9XG5cbiAgY29uc3Qgc2luZ2xlSW5kZXhCID0gZ2V0TXVsdGlPclNpbmdsZUluZGV4KGZsYWdCKTtcbiAgaWYgKHNpbmdsZUluZGV4QiA+PSAwKSB7XG4gICAgY29uc3QgX2ZsYWcgPSBnZXRQb2ludGVycyhjb250ZXh0LCBzaW5nbGVJbmRleEIpO1xuICAgIGNvbnN0IF9pbml0aWFsID0gZ2V0SW5pdGlhbEluZGV4KF9mbGFnKTtcbiAgICBzZXRGbGFnKGNvbnRleHQsIHNpbmdsZUluZGV4QiwgcG9pbnRlcnMoX2ZsYWcsIF9pbml0aWFsLCBpbmRleEEpKTtcbiAgfVxuXG4gIHNldFZhbHVlKGNvbnRleHQsIGluZGV4QSwgZ2V0VmFsdWUoY29udGV4dCwgaW5kZXhCKSk7XG4gIHNldFByb3AoY29udGV4dCwgaW5kZXhBLCBnZXRQcm9wKGNvbnRleHQsIGluZGV4QikpO1xuICBzZXRGbGFnKGNvbnRleHQsIGluZGV4QSwgZ2V0UG9pbnRlcnMoY29udGV4dCwgaW5kZXhCKSk7XG4gIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBpbmRleEEsIGdldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBpbmRleEIpKTtcblxuICBzZXRWYWx1ZShjb250ZXh0LCBpbmRleEIsIHRtcFZhbHVlKTtcbiAgc2V0UHJvcChjb250ZXh0LCBpbmRleEIsIHRtcFByb3ApO1xuICBzZXRGbGFnKGNvbnRleHQsIGluZGV4QiwgdG1wRmxhZyk7XG4gIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBpbmRleEIsIHRtcFBsYXllckJ1aWxkZXJJbmRleCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNpbmdsZVBvaW50ZXJWYWx1ZXMoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4U3RhcnRQb3NpdGlvbjogbnVtYmVyKSB7XG4gIGZvciAobGV0IGkgPSBpbmRleFN0YXJ0UG9zaXRpb247IGkgPCBjb250ZXh0Lmxlbmd0aDsgaSArPSBTdHlsaW5nSW5kZXguU2l6ZSkge1xuICAgIGNvbnN0IG11bHRpRmxhZyA9IGdldFBvaW50ZXJzKGNvbnRleHQsIGkpO1xuICAgIGNvbnN0IHNpbmdsZUluZGV4ID0gZ2V0TXVsdGlPclNpbmdsZUluZGV4KG11bHRpRmxhZyk7XG4gICAgaWYgKHNpbmdsZUluZGV4ID4gMCkge1xuICAgICAgY29uc3Qgc2luZ2xlRmxhZyA9IGdldFBvaW50ZXJzKGNvbnRleHQsIHNpbmdsZUluZGV4KTtcbiAgICAgIGNvbnN0IGluaXRpYWxJbmRleEZvclNpbmdsZSA9IGdldEluaXRpYWxJbmRleChzaW5nbGVGbGFnKTtcbiAgICAgIGNvbnN0IGZsYWdWYWx1ZSA9IChpc0RpcnR5KGNvbnRleHQsIHNpbmdsZUluZGV4KSA/IFN0eWxpbmdGbGFncy5EaXJ0eSA6IFN0eWxpbmdGbGFncy5Ob25lKSB8XG4gICAgICAgICAgKGlzQ2xhc3NCYXNlZChjb250ZXh0LCBzaW5nbGVJbmRleCkgPyBTdHlsaW5nRmxhZ3MuQ2xhc3MgOiBTdHlsaW5nRmxhZ3MuTm9uZSkgfFxuICAgICAgICAgIChpc1Nhbml0aXphYmxlKGNvbnRleHQsIHNpbmdsZUluZGV4KSA/IFN0eWxpbmdGbGFncy5TYW5pdGl6ZSA6IFN0eWxpbmdGbGFncy5Ob25lKTtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGbGFnID0gcG9pbnRlcnMoZmxhZ1ZhbHVlLCBpbml0aWFsSW5kZXhGb3JTaW5nbGUsIGkpO1xuICAgICAgc2V0RmxhZyhjb250ZXh0LCBzaW5nbGVJbmRleCwgdXBkYXRlZEZsYWcpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbnNlcnROZXdNdWx0aVByb3BlcnR5KFxuICAgIGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyLCBjbGFzc0Jhc2VkOiBib29sZWFuLCBuYW1lOiBzdHJpbmcsIGZsYWc6IG51bWJlcixcbiAgICB2YWx1ZTogc3RyaW5nIHwgYm9vbGVhbiwgcGxheWVySW5kZXg6IG51bWJlcik6IHZvaWQge1xuICBjb25zdCBkb1NoaWZ0ID0gaW5kZXggPCBjb250ZXh0Lmxlbmd0aDtcblxuICAvLyBwcm9wIGRvZXMgbm90IGV4aXN0IGluIHRoZSBsaXN0LCBhZGQgaXQgaW5cbiAgY29udGV4dC5zcGxpY2UoXG4gICAgICBpbmRleCwgMCwgZmxhZyB8IFN0eWxpbmdGbGFncy5EaXJ0eSB8IChjbGFzc0Jhc2VkID8gU3R5bGluZ0ZsYWdzLkNsYXNzIDogU3R5bGluZ0ZsYWdzLk5vbmUpLFxuICAgICAgbmFtZSwgdmFsdWUsIHBsYXllckluZGV4KTtcblxuICBpZiAoZG9TaGlmdCkge1xuICAgIC8vIGJlY2F1c2UgdGhlIHZhbHVlIHdhcyBpbnNlcnRlZCBtaWR3YXkgaW50byB0aGUgYXJyYXkgdGhlbiB3ZVxuICAgIC8vIG5lZWQgdG8gdXBkYXRlIGFsbCB0aGUgc2hpZnRlZCBtdWx0aSB2YWx1ZXMnIHNpbmdsZSB2YWx1ZVxuICAgIC8vIHBvaW50ZXJzIHRvIHBvaW50IHRvIHRoZSBuZXdseSBzaGlmdGVkIGxvY2F0aW9uXG4gICAgdXBkYXRlU2luZ2xlUG9pbnRlclZhbHVlcyhjb250ZXh0LCBpbmRleCArIFN0eWxpbmdJbmRleC5TaXplKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWx1ZUV4aXN0cyh2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IGJvb2xlYW4sIGlzQ2xhc3NCYXNlZD86IGJvb2xlYW4pIHtcbiAgaWYgKGlzQ2xhc3NCYXNlZCkge1xuICAgIHJldHVybiB2YWx1ZSA/IHRydWUgOiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdmFsdWUgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVJbml0aWFsRmxhZyhcbiAgICBuYW1lOiBzdHJpbmcsIGlzQ2xhc3NCYXNlZDogYm9vbGVhbiwgc2FuaXRpemVyPzogU3R5bGVTYW5pdGl6ZUZuIHwgbnVsbCkge1xuICBpZiAoaXNDbGFzc0Jhc2VkKSB7XG4gICAgcmV0dXJuIFN0eWxpbmdGbGFncy5DbGFzcztcbiAgfSBlbHNlIGlmIChzYW5pdGl6ZXIgJiYgc2FuaXRpemVyKG5hbWUpKSB7XG4gICAgcmV0dXJuIFN0eWxpbmdGbGFncy5TYW5pdGl6ZTtcbiAgfVxuICByZXR1cm4gU3R5bGluZ0ZsYWdzLk5vbmU7XG59XG5cbmZ1bmN0aW9uIGhhc1ZhbHVlQ2hhbmdlZChcbiAgICBmbGFnOiBudW1iZXIsIGE6IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsLCBiOiBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCk6IGJvb2xlYW4ge1xuICBjb25zdCBpc0NsYXNzQmFzZWQgPSBmbGFnICYgU3R5bGluZ0ZsYWdzLkNsYXNzO1xuICBjb25zdCBoYXNWYWx1ZXMgPSBhICYmIGI7XG4gIGNvbnN0IHVzZXNTYW5pdGl6ZXIgPSBmbGFnICYgU3R5bGluZ0ZsYWdzLlNhbml0aXplO1xuICAvLyB0aGUgdG9TdHJpbmcoKSBjb21wYXJpc29uIGVuc3VyZXMgdGhhdCBhIHZhbHVlIGlzIGNoZWNrZWRcbiAgLy8gLi4uIG90aGVyd2lzZSAoZHVyaW5nIHNhbml0aXphdGlvbiBieXBhc3NpbmcpIHRoZSA9PT0gY29tcGFyc2lvblxuICAvLyB3b3VsZCBmYWlsIHNpbmNlIGEgbmV3IFN0cmluZygpIGluc3RhbmNlIGlzIGNyZWF0ZWRcbiAgaWYgKCFpc0NsYXNzQmFzZWQgJiYgaGFzVmFsdWVzICYmIHVzZXNTYW5pdGl6ZXIpIHtcbiAgICAvLyB3ZSBrbm93IGZvciBzdXJlIHdlJ3JlIGRlYWxpbmcgd2l0aCBzdHJpbmdzIGF0IHRoaXMgcG9pbnRcbiAgICByZXR1cm4gKGEgYXMgc3RyaW5nKS50b1N0cmluZygpICE9PSAoYiBhcyBzdHJpbmcpLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvLyBldmVyeXRoaW5nIGVsc2UgaXMgc2FmZSB0byBjaGVjayB3aXRoIGEgbm9ybWFsIGVxdWFsaXR5IGNoZWNrXG4gIHJldHVybiBhICE9PSBiO1xufVxuXG5leHBvcnQgY2xhc3MgQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXI8VD4gaW1wbGVtZW50cyBQbGF5ZXJCdWlsZGVyIHtcbiAgcHJpdmF0ZSBfdmFsdWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVsbH0gPSB7fTtcbiAgcHJpdmF0ZSBfZGlydHkgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZmFjdG9yeTogQm91bmRQbGF5ZXJGYWN0b3J5PFQ+O1xuXG4gIGNvbnN0cnVjdG9yKGZhY3Rvcnk6IFBsYXllckZhY3RvcnksIHByaXZhdGUgX2VsZW1lbnQ6IEhUTUxFbGVtZW50LCBwcml2YXRlIF90eXBlOiBCaW5kaW5nVHlwZSkge1xuICAgIHRoaXMuX2ZhY3RvcnkgPSBmYWN0b3J5IGFzIGFueTtcbiAgfVxuXG4gIHNldFZhbHVlKHByb3A6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIGlmICh0aGlzLl92YWx1ZXNbcHJvcF0gIT09IHZhbHVlKSB7XG4gICAgICB0aGlzLl92YWx1ZXNbcHJvcF0gPSB2YWx1ZTtcbiAgICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBidWlsZFBsYXllcihjdXJyZW50UGxheWVyPzogUGxheWVyfG51bGwpOiBQbGF5ZXJ8dW5kZWZpbmVkfG51bGwge1xuICAgIC8vIGlmIG5vIHZhbHVlcyBoYXZlIGJlZW4gc2V0IGhlcmUgdGhlbiB0aGlzIG1lYW5zIHRoZSBiaW5kaW5nIGRpZG4ndFxuICAgIC8vIGNoYW5nZSBhbmQgdGhlcmVmb3JlIHRoZSBiaW5kaW5nIHZhbHVlcyB3ZXJlIG5vdCB1cGRhdGVkIHRocm91Z2hcbiAgICAvLyBgc2V0VmFsdWVgIHdoaWNoIG1lYW5zIG5vIG5ldyBwbGF5ZXIgd2lsbCBiZSBwcm92aWRlZC5cbiAgICBpZiAodGhpcy5fZGlydHkpIHtcbiAgICAgIGNvbnN0IHBsYXllciA9XG4gICAgICAgICAgdGhpcy5fZmFjdG9yeS5mbih0aGlzLl9lbGVtZW50LCB0aGlzLl90eXBlLCB0aGlzLl92YWx1ZXMgISwgY3VycmVudFBsYXllciB8fCBudWxsKTtcbiAgICAgIHRoaXMuX3ZhbHVlcyA9IHt9O1xuICAgICAgdGhpcy5fZGlydHkgPSBmYWxzZTtcbiAgICAgIHJldHVybiBwbGF5ZXI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuIl19