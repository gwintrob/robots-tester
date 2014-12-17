var DEFAULT_AGENT = 'Mozilla/5.0 (X11; Linux i686; rv:5.0) Gecko/20100101 Firefox/5.0';
var agent;

function test() {
  $('.status').text('Fetching robots.txt');
  chrome.tabs.getSelected(null, function(tab) {
    var url = tab.url;
    var el = $('<a>').prop('href', url);
    var robotsUrl = el.prop('protocol') + '//' + el.prop('hostname') + '/robots.txt';
    $('.status').text('Downloading: ' + robotsUrl);
    $.ajax({
      url: robotsUrl,
      success: function (robots) {
        var lines = robots.split('\n');
        var msg = 'Downloaded: ' + lines.length + ' lines';
        $('.result').text(msg);
        var parser = new RobotParser();
        parser.parse(lines);
        var result = parser.canFetch(agent || DEFAULT_AGENT, url);
        $('.status').text(msg);
        if (result) {
          $('.result').text('Allowed');
        } else {
          $('.result').text('Not allowed');
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('.result').text('Allowed - Could not download.');
      }
    });
  });
}

$(function() {
  $('#input-agent').attr('placeholder', DEFAULT_AGENT);
  var agentKey = 'robots-tester-agent';
  chrome.storage.local.get(agentKey, function (agentResult) {
    var newAgent = agentResult[agentKey];
    if (newAgent && newAgent != agent) {
      agent = newAgent;
      $('#input-agent').val(agent);
    }

    $('#button-test').click(function () {
      var newValue = $('#input-agent').val();
      if (newValue && newValue != agent) {
        agent = newValue;
        var setAgent = {};
        setAgent[agentKey] = agent;
        chrome.storage.local.set(setAgent, function () {
          test();
        });
      } else {
        test();
      }
    });
  });
});
