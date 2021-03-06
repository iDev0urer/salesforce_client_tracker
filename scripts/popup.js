// Identifiers can be found here: http://jscs.info/rules.html
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers, maximumLineLength, disallowMultipleVarDecl

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function subDomain(url, callback) {

  var prefix, subdomain;

  prefix = url.includes('www.');

  // IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
  url = url.replace(new RegExp(/^\s+/), ''); // START
  url = url.replace(new RegExp(/\s+$/), ''); // END

  // IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
  url = url.replace(new RegExp(/\\/g), '/');

  // IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
  url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i), '');

  // IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
  url = url.replace(new RegExp(/^www\./i), '');

  // REMOVE COMPLETE STRING FROM FIRST FORWARD SLASH ON
  url = url.replace(new RegExp(/\/(.*)/), '');

  // REMOVES '.??.??' OR '.???.??' FROM END - e.g. '.CO.UK', '.COM.AU'
  if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
    url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i), '');

    // REMOVES '.??' or '.???' or '.????' FROM END - e.g. '.US', '.COM', '.INFO'
  } else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
    url = url.replace(new RegExp(/\.[a-z]{2,4}$/i), '');
  }

  // CHECK TO SEE IF THERE IS A DOT '.' LEFT IN THE STRING
  var subDomain = url.match(new RegExp(/\./g)) ? true : false;

  callback(prefix, subDomain);
}

$(document).ready(function () {

  $('.wrapper').html('\n    <div class="bubblingG">\n      <span id="bubblingG_1">\n      </span>\n      <span id="bubblingG_2">\n      </span>\n      <span id="bubblingG_3">\n      </span>\n    </div>');

  var currentTab = new CurrentTab();
  currentTab.get(function (tabs) {
    var tabUrl = new URL(tabs[0].url).hostname;
    subDomain(tabUrl, function (prefix, subdomain) {
      if (prefix) {
        tabUrl = tabUrl.replace('www.', '');
      }

      subDomain(tabUrl, function (prefix, subdomain) {
        if (subdomain) {
          tabUrl = tabUrl.substring(tabUrl.indexOf('.') + 1);
        }
        return tabUrl;
      });
    });

    var json = new JsonCaller();
    json.get('https://nuvi-ditto.herokuapp.com/salesforce_contacts.json?domain_name=' + tabUrl, function (response, executionTime) {
      json.parseResponse(response, function (data) {
        renderTemplate(data);
      });
      console.log('Getting json took ' + executionTime + ' to execute.');
    });
  });

  function renderTemplate(json) {
    var renderer = new TemplateRenderer(json);
    $('.wrapper').html(renderer.run());
  }
});

var ErrorHandler = (function () {
  function ErrorHandler() {
    _classCallCheck(this, ErrorHandler);
  }

  _createClass(ErrorHandler, [{
    key: 'warn',
    value: function warn(warning) {
      console.log('%c' + warning, 'color: #E6E600');
      return false;
    }
  }, {
    key: 'error',
    value: function error(_error) {
      console.log('%c' + _error, 'color: #EE0000');
      return false;
    }
  }]);

  return ErrorHandler;
})();

var JsonCaller = (function () {

  // var json = new JsonCaller;
  // json.get('url.com', false);
  // console.log(json.display());

  function JsonCaller() {
    _classCallCheck(this, JsonCaller);

    this.err = new ErrorHandler();
  }

  _createClass(JsonCaller, [{
    key: 'get',
    value: function get(url, callback) {
      console.log('Getting data from ' + url);

      var startTime = new Date().getTime(); // Start a timer to see how long the function takes to execute

      var _this = this;
      var req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          if (req.status === 200) {
            var endTime = new Date().getTime();
            var executionTime = (endTime - startTime) * 0.001;
            callback(JSON.parse(req.response), executionTime);
            this.data = req.response;
          } else {
            _this.err.error('Server responded with error ' + req.status + '. Failed to get json data from ' + url);
          }
        }
      };
      req.send();
    }
  }, {
    key: 'parseResponse',
    value: function parseResponse(json, callback) {

      var domainName, companyName, resourceUrl, leadContactedRecently, opportunityContactedRecently, isClient, lastContact, okToContact, leads, opportunities, hasOpportunity, hasLead, hasFutureActivity;

      domainName = json.domain_name;
      companyName = json.company_name;
      resourceUrl = json.resource_url;
      leadContactedRecently = json.lead_contacted_recently;
      opportunityContactedRecently = json.opportunity_contacted_recently;
      isClient = json.is_client;
      lastContact = json.last_contact;
      okToContact = json.ok_to_contact;
      leads = json.leads;
      opportunities = json.opportunities;
      hasOpportunity = json.opportunities.length > 0 ? true : false;
      hasLead = json.leads.length > 0 ? true : false;
      hasFutureActivity = json.has_future_activity;

      var data = {
        domainName: domainName,
        companyName: companyName,
        resourceUrl: resourceUrl,
        leadContactedRecently: leadContactedRecently,
        opportunityContactedRecently: opportunityContactedRecently,
        isClient: isClient,
        lastContact: lastContact,
        okToContact: okToContact,
        leads: leads,
        opportunities: opportunities,
        hasOpportunity: hasOpportunity,
        hasLead: hasLead,
        hasFutureActivity: hasFutureActivity
      };

      callback(data);
    }
  }, {
    key: 'display',
    value: function display() {
      return this.data;
    }
  }]);

  return JsonCaller;
})();

var CurrentTab = (function () {

  // var sites = new getSiteList();
  // console.log(sites()); // returns an array of sites ["nuvi.com", "gmail.com"]

  function CurrentTab() {
    _classCallCheck(this, CurrentTab);

    this.err = new ErrorHandler();
  }

  _createClass(CurrentTab, [{
    key: 'get',
    value: function get(callback) {
      var query = { active: true, currentWindow: true };
      chrome.tabs.query(query, callback);
    }
  }]);

  return CurrentTab;
})();

var TemplateChecker = (function () {
  function TemplateChecker(array) {
    _classCallCheck(this, TemplateChecker);

    this.TemplateRenderer = new TemplateRenderer();
    this.err = new ErrorHandler();
    this.array = array;
  }

  _createClass(TemplateChecker, [{
    key: 'moreThanOne',
    value: function moreThanOne(array) {
      if (!array.isArray()) {
        this.err(506, 'The value passed into moreThanOne() was not an array');
      } else {
        var length = array.length;
        return length > 1 ? true : false;
      }
    }
  }, {
    key: 'check',
    value: function check() {
      if (moreThanOne(this.array)) {
        this.TemplateRenderer('list', array);
      } else {
        this.TemplateRenderer('single', array);
      }
    }
  }]);

  return TemplateChecker;
})();

var TemplateRenderer = (function () {
  function TemplateRenderer(data) {
    _classCallCheck(this, TemplateRenderer);

    this.data = data;
    this.err = new ErrorHandler();

    this._checkValue(this.data);

    this.templatePath = chrome.extension.getURL('templates/single.html');

    this.run();
  }

  _createClass(TemplateRenderer, [{
    key: '_checkValue',
    value: function _checkValue(value) {
      if (!value) {
        err(406, 'Either template or data was not defined or returned false');
      }
    }
  }, {
    key: '_checkOk',
    value: function _checkOk(data) {

      var hasLead = data.hasLead;
      var leadContactedRecently = data.leadContactedRecently;
      var hasOpportunity = data.hasOpportunity;
      var hasFutureActivity = data.hasFutureActivity;
      var opportunityContactedRecently = data.opportunityContactedRecently;
      var client = data.isClient;

      // Replace false with hasFutureActivity

      // Clients

      if (client === true) {
        return false;
      }

      if (client == 'former') {
        return false;
      }

      // Opportutities

      if (hasOpportunity && opportunityContactedRecently) {
        return false;
      }

      if (hasOpportunity && !opportunityContactedRecently) {
        return 'maybe';
      }

      // Leads

      if (hasLead && leadContactedRecently) {
        return false;
      }

      if (hasLead && !leadContactedRecently) {
        return 'maybe';
      }

      return true;
    }
  }, {
    key: 'run',
    value: function run() {

      var _this = this;
      var statusText;
      var statusIcon;
      if (this._checkOk(_this.data) === 'maybe') {
        statusText = 'MAYBE OK TO CONTACT';
        statusIcon = 'maybe';
        this.status = 'maybe';
        //var message = new Message('contentscript', 'setIcon', 'icon', 'warn');
        //message.send();
      } else if (this._checkOk(_this.data) === true) {
        statusText = 'OK TO CONTACT';
        statusIcon = 'success';
        this.status = 'ok';
        //var message = new Message('contentscript', 'setIcon', 'icon', 'ok');
        //message.send();
      } else {
        statusText = 'DO NOT CONTACT';
        statusIcon = 'error';
        this.status = 'no';
        //var message = new Message('contentscript', 'setIcon', 'icon', 'error');
        //message.send();
      }

      var statusList = _this.buildList(_this.data, _this.status);

      var template = '<div class="site-single">\n                        <div class="title">\n                          <a href="' + _this.data.resourceUrl + '" class="linkToSalesforce">' + _this.data.companyName + '</a>\n                        </div>\n                        <div class="status">\n                          <div class="status-icon--' + statusIcon + '"></div>\n                            <div class="status__text">\n                              ' + statusText + '\n                            </div>\n                          </div>\n                          ' + statusList + '\n                        </div>';

      return template;
    }
  }, {
    key: 'buildList',
    value: function buildList(data, status) {

      var _this = this;

      var safeClass = 'safe-to-contact';
      var maybeClass = 'maybe-ok-to-contact';
      var unsafeClass = 'unsafe-to-contact';

      var opportunityContactClass = data.opportunityContactedRecently === false ? safeClass : unsafeClass;
      var clientClass = data.isClient === false ? safeClass : unsafeClass;

      var opportunityContactText = data.opportunityContactedRecently === true ? 'Last opportunity contacted less than 60 days ago' : 'Last opportunity contacted less than 60 days ago';
      var clientText = data.isClient === true ? 'Already a client' : 'Not a client yet';

      var leadContact = function leadContact() {

        var recent = data.leadContactedRecently;
        var futureActivity = data.hasFutureActivity;
        var lead = data.hasLead;
        var className;
        var textContent;

        if (!lead && !futureActivity) {
          className = safeClass;
          textContent = 'No leads exist for contact';
        } else if (recent && !futureActivity) {
          className = unsafeClass;
          textContent = 'Last lead contacted less than 15 days ago';
        } else if (!recent && !futureActivity) {
          className = safeClass;
          textContent = 'Last lead contacted more than 15 days ago';
        } else if (futureActivity) {
          className = maybeClass;
          textContent = 'Future activity exists for contact';
        }

        return '<li class="' + className + '">\n                <a href="#">' + textContent + '</a>\n              </li>';
      };

      var opportunity = function opportunity() {

        var opportunity = data.hasOpportunity;
        var recent = data.opportunityContactedRecently;
        var className;
        var textContent;

        if (!opportunity) {
          className = safeClass;
          textContent = 'No opportunities exist for contact';
        } else if (opportunity && recent) {
          className = unsafeClass;
          textContent = 'Last opportunity contacted within 60 days';
        } else if (opportunity && !recent) {
          className = maybeClass;
          textContent = 'Last opportunity contacted 60+ days ago';
        }

        return '<li class="' + className + '">\n                <a href="#">' + textContent + '</a>\n              </li>';
      };

      var clientStatus = function clientStatus() {

        var client = data.isClient;
        var className;
        var textContent;

        if (client && client !== 'former') {
          className = unsafeClass;
          textContent = 'Contact is already a client';
        } else if (client === 'former') {
          className = unsafeClass;
          textContent = 'Contact is a former client';
        } else if (!client) {
          className = safeClass;
          textContent = 'Contact is not a client... yet';
        }

        return '<li class="' + className + '">\n                <a href="#">' + textContent + '</a>\n              </li>';
      };

      var template = '<ul class="status-list">\n                      ' + leadContact() + '\n                      ' + opportunity() + '\n                      ' + clientStatus() + '\n                    </ul>';

      return template;
    }
  }]);

  return TemplateRenderer;
})();

// class Message {
//   constructor(to, method, messageName, messageText) {
//     this.err = new ErrorHandler;
//     this.message = {};
//     this.message['to'] = to;
//     this.message['method'] = method
//     this.message[messageName] = messageText;
//     this.send();
//   }
//
//   send() {
//     chrome.runtime.sendMessage(this.message, function(response) {
//       console.log(response);
//     });
//   }
//
// }