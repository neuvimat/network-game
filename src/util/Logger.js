import {Time} from "Root/util/Time";
import {OUtils} from "Root/util/OUtils";

export const MAX_LEVEL = 10;

/**
 * @enum {string}
 */
export const LoggerTags = {
    NO_TAG: 'Untagged',
    NETWORK: 'Network',
    GAME: 'Game',
    SNAPSHOTS: 'Snapshots',
    INPUT: 'Input',
    RENDER: 'Render'
};
/**
 * @type {{FIXME: string, TEMP: string, ERROR: string, INFO: string, WARNING: string}}
 */
export const LoggerSeverity = {
    INFO: 'Info',        // Regular log message
    WARNING: 'Warning',     // Warning
    ERROR: 'Error',       // Error
    FIXME: 'Fixme',       // Temporary log taunting the dev to fix a known issue that has temporary solution
    TEMP: 'Temp',        // Temporary log used for testing, reminding the dev to later delete this log
};

/**
 * Logger singleton. Sort of underused considering the time spent on making it work and rendered with {@link LoggerUI}
 * @namespace
 */
export const Logger = {
    logByTag: {},
    logByLevel: [],
    logBySeverity: {},

    init(consoleLevel) {
        for (let t in LoggerTags) {
            this.logByTag[LoggerTags[t]] = [];
        }
        for (let s in LoggerSeverity) {
            this.logBySeverity[LoggerSeverity[s]] = [];
        }
        for (let i = 0; i < MAX_LEVEL; i++) {
            this.logByLevel.push([]);
        }
        this.consoleLevel = consoleLevel;

        this.logO('Logger initialized.', {console: true})
    },

    log(msg, severity = LoggerSeverity.INFO, tag = LoggerTags.NO_TAG, level = 0, useRegularConsole = false) {
        if (level >= MAX_LEVEL) {
            console.warn("Trying to log a message with level higher than",MAX_LEVEL,'dropping the level down to', MAX_LEVEL);
            level = MAX_LEVEL;
        }
        let log = {msg:msg, severity:severity, tag:tag, level:level, time: new Date()};
        this.logByTag[tag].push(log);
        this.logByLevel[level].push(log);
        this.logBySeverity[severity].push(log);

        /// #if DEBUG
        if (useRegularConsole && level <= Logger.consoleLevel) {
            if (severity == LoggerSeverity.ERROR) {
                console.error(msg);
            }
            else if (severity == LoggerSeverity.WARNING) {
                console.warn(msg);
            }
            else {
                let addition = '';
                switch (severity) {
                    case LoggerSeverity.FIXME:
                        addition = 'FIXME: ';
                        break;
                    case LoggerSeverity.TEMP:
                        addition = 'TEMP: ';
                        break;
                    default:
                        break;
                }
                console.log(addition + msg);
            }
        }
        /// #endif
    },

    /**
     * Alias for log, that allows usage of options object for convenience.
     * @param {String} msg
     * @param {Object} options
     * @param {LoggerSeverity} [options.severity]
     * @param {LoggerTags} [options.tag]
     * @param {Number} [options.level]
     * @param {Boolean} [options.console]
     */
    logO(msg, options) {
        OUtils.defaults(options, defaults);
        Logger.log(msg, options.severity, options.tag, options.level, options.console)
    },
};

const defaults = {severity: LoggerSeverity.INFO, tag: LoggerTags.NO_TAG, level: 0, console: false};