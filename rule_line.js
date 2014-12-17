var RE_SPECIAL_CHARS = ['.', '?', '+'];

function RuleLine(path, allowance) {
  if (path === '' && !allowance) allowance = true;

  this.path = encodeURIComponent(path).toLowerCase();

  var rePathString = path;
  RE_SPECIAL_CHARS.forEach(function (c) {
    rePathString = rePathString.replace(c, '\\' + c);
  });

  rePathString = rePathString.replace('*', '.*') + '.*';
  if (rePathString.length > 0 && rePathString[0] !== '/') {
    rePathString = '.*' + rePathString;
  }

  this.rePath = new RegExp(rePathString, 'i');
  this.allowance = allowance;
}

RuleLine.prototype.appliesTo = function(name) {
  var self = this;

  return (
    self.path === '*' ||
    name.indexOf(self.path) === 0 ||
    decodeURIComponent(name).match(self.rePath)
  );
};

RuleLine.prototype.toString = function() {
  var self = this;
  var string = 'Allow';
  if (!self.allowance) string = 'Disallow';
  string += ': ';
  string += self.path;
  return string;
};
