/**
 * @callback Comparator
 * @param {*} a
 * @param {*} b
 * @return {number}
 */

/**
 * <p>Render a data model as a nice self updating HTML table.</p>
 * <p><b>Note: do not change the number of columns once a table assumes a HTMLNode!</p>
 * @class TableRenderer
 */
export class TableRenderer {
    /**
     * @param {array.<string>} headers
     * @param {Comparator} comparator
     */
    constructor(headers, comparator) {
        this.header = headers;
        this.data = {}; // array of values for each key
        this.tables = []; // one table for each assumed node (HTML wrapper where we render the data as table)
        this.order = []; // array of strings, each string represents a row key from this.data, the order in which the rows should be rendered is the same as the order of keys in this array
        this.comparator = comparator;
    }

    /**
     * Set new headers.
     * @param {array<string>} headers
     */
    setHeader(headers) {
        this.header = headers;
        for (let table of this.tables) {
            for (let i = 0; i < headers.length; i++) {
                table.header[i].innerText = headers[i];
            }
        }
    }

    /**
     * Set a different comparator.
     * @param {Comparator} fn
     */
    setComparator(fn) {
        this.comparator = fn;
    }

    _sort() {
        // a and b are the keys (IDs) under which we find the rows in this.data
        this.order.sort((a, b) => {
                // Transform the row IDs contained in this.order to actual data entries that are then sent to the comparator
                return this.comparator(this.data[a], this.data[b]);
            }
        );
    }

    /**
     * Add a new row with specified ID
     * @param {string} rowId
     * @param {array} row
     */
    addDataRow(rowId, row) {
        if (this.data[rowId] === undefined) {
            this.data[rowId] = row;
            let pos = this._insertSortId(row, rowId);

            for (let table of this.tables) {
                let tr = this._makeTR(rowId, row, table); // this already appended the tr to the end of tbody
                // Since we are already at the end, reposition us only if our expected pos is NOT the end
                if (pos + 1 !== this.order.length) {
                    table.tbody.insertBefore(tr, table.rows[this.order[pos + 1]].tr);
                }
            }
        }
    }

    _insertSortId(row, rowId) {
        let pos = 0;
        for (let id of this.order) {
            if (this.comparator(this.data[id], row) > 0) {
                this.order.splice(pos, 0, rowId);
                return pos;
            }
            else pos++;
        }
        // If we get here, it means that the newly added row should be the last in the table
        this.order.push(rowId);
        return pos;
    }

    /**
     * Remove a whole row from data model
     * @param {string} id
     */
    removeDataRow(id) {
        delete this.data[id];
        for (let table of this.tables) {
            table.rows[id].tr.remove();
            delete table.rows[id];
        }
        this.order.splice(this.order.indexOf(id), 1);
    }

    /**
     * Update one column of a row
     * @param {string} rowId
     * @param {number} dataIndex
     * @param {*} newValue
     */
    updateDataRow(rowId, dataIndex, newValue) {
        if (this.data[rowId] === undefined) return;
        this.data[rowId][dataIndex] = newValue;
        this._sort();
        let newPosition = this.order.indexOf(rowId);
        if (newPosition === this.order.length - 1) {
            for (let table of this.tables) {
                table.rows[rowId].td[dataIndex].innerText = newValue;
                table.tbody.appendChild(table.rows[rowId].tr);
            }
        }
        else {
            for (let table of this.tables) {
                table.rows[rowId].td[dataIndex].innerText = newValue;
                table.tbody.insertBefore(table.rows[rowId].tr, table.rows[this.order[newPosition + 1]].tr);
            }
        }
    }

    /**
     * Render the table inside this node. If any data inside the table changes (via the provided methods), the table
     * HTML automatically updates
     * @param {HTMLElement} node
     */
    assumeNode(node) {
        // Helper object that keeps track of HTML elements
        let tableE = {table: null, rows: {}, header: [], wrapper: node};
        this._makeTable(tableE);
    }

    /**
     * Draw a full table from scratch. Consider this a 'full update'. Once this is done, all other changes in the table
     * are done by rendering only the changes themselves. The table is never fully re-rendered since this initial setup.
     * @param tableE
     * @return {HTMLTableElement}
     * @private
     */
    _makeTable(tableE) {
        let table = document.createElement('table');
        tableE.table = table;
        this._makeTHead(tableE);
        this._makeTBody(tableE);
        this.tables.push(tableE);
        tableE.wrapper.appendChild(table);
        return table;
    }

    _makeTHead(tableE) {
        let thead = document.createElement('thead');
        for (let i = 0; i < this.header.length; i++) {
            let th = document.createElement('th');
            th.innerText = this.header[i];

            tableE.header.push(th);
            thead.appendChild(th);
        }
        tableE.table.appendChild(thead);
        return thead;
    }

    _makeTBody(tableE) {
        let tbody = document.createElement('tbody');
        tableE.tbody = tbody;
        for (let id of this.order) {
            this._makeTR(id, this.data[id], tableE);
        }
        tableE.table.appendChild(tbody);
        return tbody;
    }

    _makeTR(key, row, tableE) {
        let tr = document.createElement('tr');
        tableE.rows[key] = {tr: tr, td: null};
        let tds = [];
        for (let i = 0; i < row.length; i++) {
            let td = document.createElement('td');
            td.innerText = row[i];

            tds.push(td);
            tr.appendChild(td);
        }
        tableE.rows[key].td = tds;
        tableE.tbody.appendChild(tr);
        return tr;
    }
}