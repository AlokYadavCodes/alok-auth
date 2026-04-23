/**
 * 
 * @param {String} scopeString the scope string, space separated
 * @returns {Array<String>} 
 */

function getScopeArray(scopeString) {
    if (!scopeString) return [];
    return Array.from(
        scopeString
            .split(" ")
            .map((item) => item.trim())
    );
}

/**
 * expects requestedScopes and grantedScopes as array (not string)
 * @param {Array<String>} requestedScopes 
 * @param {Array<String>} grantedScopes 
 * @returns
 */
function isScopeSubset(requestedScopes, grantedScopes) {
    const granted = new Set(grantedScopes);
    return requestedScopes.every((scope) => granted.has(scope));
}

/**
 * expects requestedScopes and grantedScopes as array (not string)
 * @param {Array<String>} requestedScopes 
 * @param {Array<String>} grantedScopes 
 * @returns {Array<String>} combined unique scopes
 */
function unionScopes(existingScopes, requestedScopes) {
    return Array.from(new Set([...existingScopes, ...requestedScopes]));
}

/**
 * 
 * @param {Array<String>} scope 
 * @returns {String} scope string, space separated
 */
function getScopeString(scopeArray) {
    return scopeArray.join(" ");
}

export { isScopeSubset, getScopeArray, getScopeString, unionScopes };
