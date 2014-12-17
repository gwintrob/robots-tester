function RobotParser(url) {
  this.entries = [];
  this.defaultEntry = null;
  this.disallowAll = false;
  this.allowAll = false;
  this.lastChecked = 0;  // TODO: Use this

  // TODO: Move url parsing to this class
  // if (!url) url = '';
  // this.setUrl(url);
}

RobotParser.prototype._addEntry = function (entry) {
  var self = this;
  if (entry.userAgents.indexOf('*') > -1) {
    self.defaultEntry = entry;
  } else {
    self.entries.push(entry);
  }
};

RobotParser.prototype.parse = function (lines) {
  var self = this;
  var state = 0;
  var lineNumber = 0;
  var entry = new Entry();

  lines.forEach(function (line) {
    lineNumber += 1;

    if (!line) {
      if (state === 1) {
        state = 0;
        entry = new Entry();
      } else if (state === 2) {
        self._addEntry(entry);
        state = 0;
        entry = new Entry();
      }

      return;
    }

    // Remove optional comment and strip line
    var i = line.indexOf('#');
    if (i > -1) line = line.slice(0, i);
    if (!line) return;

    i = line.indexOf(':');
    if (i > -1) {
      var beginning = $.trim(line.slice(0, i)).toLowerCase();
      var ending = decodeURIComponent($.trim(line.slice(i + 1)).toLowerCase());
      if (beginning === 'user-agent') {
        if (state === 2) {
          self._addEntry(entry);
          entry = new Entry();
        }

        state = 1;
        entry.userAgents.push(ending);
      } else if (beginning === 'disallow') {
        if (state !== 0) {
          var ruleLine = new RuleLine(ending, false);
          state = 2;
          entry.ruleLines.push(ruleLine);
        }
      } else if (beginning === 'allow') {
        if (state !== 0) {
          var ruleLine = new RuleLine(ending, true);
          state = 2;
          entry.ruleLines.push(ruleLine);
        }
      }
    }
  });

  if (state === 2) self._addEntry(entry);
};

RobotParser.prototype.canFetch = function (agent, url) {
  var self = this;
  if (self.disallowAll) return false;
  if (self.allowAll) return true;

  var el = document.createElement('a');
  el.href = decodeURI(url);
  url = encodeURIComponent(el.pathname || '/').toLowerCase();

  var result;
  self.entries.forEach(function (entry) {
    if (entry.appliesTo(agent) && result === undefined) {
      result = entry.allowance(url);
    }
  });
  if (result !== undefined) return result;

  if (self.defaultEntry) return self.defaultEntry.allowance(url);
  return true;
};

RobotParser.prototype.toString = function () {
  // TODO: Handle defaultEntry
  self.entries.map(function (entry) {
    return entry.toString() + '\n';
  }).join('');
};
