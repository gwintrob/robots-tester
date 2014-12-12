function Entry() {
  this.userAgents = [];
  this.ruleLines = [];
}

Entry.prototype.toString = function () {
  var self = this;
  var result = [];

  self.userAgents.forEach(function (agent) {
    result.push('User-agent: ');
    result.push(agent);
    result.push('\n');
  });

  self.ruleLines.forEach(function (line) {
    result.push(line.toString());
    result.push('\n');
  });

  return result.join('');
};

Entry.prototype.appliesTo = function (agent) {
  var self = this;
  var agentName = agent.split('/')[0].toLowerCase();

  var result = false;
  this.userAgents.forEach(function (agent) {
    agent = agent.toLowerCase();
    if (agent === '*' || agentName.indexOf(agent) > -1) result = true;
  });

  return result;
};

Entry.prototype.allowance = function (name) {
  var self = this;

  if (!self.sortedRules)  {
    self.sortedRules = self.ruleLines.sort(function (a, b) {
      if (a.allowance && !b.allowance) return -1;
      if (!a.allowance && b.allowance) return 1;
      return 0;
    });
  }

  var result;
  self.sortedRules.forEach(function (rule) {
    if (rule.appliesTo(name) && result === undefined) result = rule.allowance;
  });

  if (result === undefined) result = true;
  return result;
};
