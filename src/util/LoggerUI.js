import {Logger, LoggerSeverity, LoggerTags} from "Util/Logger";
import {HTMLInputMapper} from "Util/HTMLInputMapper";
import {MAX_LEVEL} from "Root/util/Logger";

/**
 * Renderer of {@link Logger}
 */
export class LoggerUI {
    /**
     * @param logger logger to watch (since logger is a singleton, kinda useless, but thinking ahead in case separate loggers could exists)
     * @param HTMLNode html wrapper for the UI
     */
    constructor(logger, HTMLNode) {
        this._id = LoggerUI.prototype._id++;
        this._logger = logger;
        this._htmlNode = HTMLNode;
    }

    /**
     * Prepare all the html and put it inside the wrapper (which was specified in constructor)
     */
    init() {
        let filterHolder = document.createElement('div');
        let tagSearch = document.createElement('select');
        let levelMinSearch = document.createElement('input');
        let levelMaxSearch = document.createElement('input');
        let severitySearch = document.createElement('select');
        let minTimeSearch = document.createElement('input');
        let maxTimeSearch = document.createElement('input');
        let searchButton = document.createElement('button');
        let closeButton = document.createElement('button');
        let view = document.createElement('div');

        // CSS classes
        this._htmlNode.classList.add('log');
        tagSearch.classList.add('tagSearch');
        levelMinSearch.classList.add('levelMinSearch');
        levelMaxSearch.classList.add('levelMaxSearch');
        severitySearch.classList.add('severitySearch');
        minTimeSearch.classList.add('minTimeSearch');
        maxTimeSearch.classList.add('maxTimeSearch');
        searchButton.classList.add('searchButton');
        closeButton.classList.add('closeButton');
        view.classList.add('view');
        filterHolder.classList.add('filterHolder');

        // Placeholders
        levelMinSearch.placeholder = 'Min Level';
        levelMaxSearch.placeholder = 'Max Level';

        minTimeSearch.placeholder = 'From time';
        maxTimeSearch.placeholder = 'To time';

        // Fill options
        let tmp = '';
        tmp += '<option value="All">All</option>';
        for (let t in LoggerTags) {
            tmp += '<option value="' + LoggerTags[t] + '">' + LoggerTags[t] + '</option>'
        }
        tagSearch.innerHTML = tmp;

        tmp = '';
        tmp += '<option value="All">All</option>';
        for (let s in LoggerSeverity) {
            tmp += '<option value="' + LoggerSeverity[s] + '">' + LoggerSeverity[s] + '</option>'
        }
        severitySearch.innerHTML = tmp;
        searchButton.innerHTML = 'Search';
        closeButton.innerHTML = 'Close';

        // Add interactivity to search
        searchButton.addEventListener('click', () => {
            // If we do it like this we do not have to store them elements in the class fields
            this.search(tagSearch.value, levelMinSearch.value, levelMaxSearch.value, severitySearch.value, minTimeSearch.value, maxTimeSearch.value, view)
        });
        closeButton.addEventListener('click', () => {
            this.hide();
        });

        // Append all
        filterHolder.appendChild(tagSearch);
        filterHolder.appendChild(levelMinSearch);
        filterHolder.appendChild(levelMaxSearch);
        filterHolder.appendChild(severitySearch);
        filterHolder.appendChild(minTimeSearch);
        filterHolder.appendChild(maxTimeSearch);
        filterHolder.appendChild(searchButton);
        filterHolder.appendChild(closeButton);
        this._htmlNode.appendChild(filterHolder);
        this._htmlNode.appendChild(view);

        /// #if DEBUG
        console.log('LoggerUI initialized.');
        /// #endif
    }

    search(tag, levelMin, levelMax, severity, minTime, maxTime, view) {
        let searchSet = [];
        if (tag != 'All') {
            searchSet = searchSet.concat(this._logger.logByTag[tag]);
        }
        else {
            searchSet = this._logger.logByLevel.flat();
        }
        if (severity != 'All') {
            searchSet = searchSet.filter((log) => {
                return log.severity == severity;
            })
        }
        searchSet = searchSet.filter((log) => {
            return log.level >= (levelMin || 0) && log.level <= (levelMax || MAX_LEVEL) && log.time >= (minTime || 0) && log.time <= (maxTime || Number.MAX_SAFE_INTEGER);
        });
        searchSet.sort((a, b)=>{return b.time - a.time});

        console.log('Search yielded ' + searchSet.length + ' results');

        view.innerHTML = '';
        for (let log of searchSet) {
            let t = ('' + log.time.getHours()).padStart(2, '0') + ':' + ('' + log.time.getMinutes()).padStart(2, '0') + ':' + ('' + log.time.getSeconds()).padStart(2, '0') + ':' +  ('' + log.time.getMilliseconds()).padStart(2, '0');
            view.insertAdjacentHTML("afterbegin", `<div data-severity="${log.severity}">[${log.severity}:${log.level}] ${log.tag}: ${t} - ${log.msg}</div>`);
        }
    }

    show() {
        this._htmlNode.style.display = 'flex';
    }

    hide() {
        this._htmlNode.style.display = 'none';
    }
}

LoggerUI.prototype._id = 0;