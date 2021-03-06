import semVerCmp from 'semver-compare';
import * as currentVersion from '../../public/version.json';

/**
 * Check if we support current backend version
 * @param {string} version backend version from response
 * @returns {boolean} true if supported
 */
const checkBackendVersion = (version) => {
    if (semVerCmp(version, currentVersion.supportedBackendMaxVersion) > 0 || semVerCmp(version, currentVersion.supportedBackendMinVersion) < 0) {
        return false;
    }
    return true;
};

export default checkBackendVersion;
