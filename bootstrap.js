// based on aug 12 2015 - https://dxr.mozilla.org/mozilla-central/source/browser/base/content/test/general/browser_drag.js#8
// Imports
const {classes: Cc, interfaces: Ci, manager: Cm, results: Cr, utils: Cu, Constructor: CC} = Components;

Cu.import('resource://gre/modules/devtools/Console.jsm');
Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/Promise.jsm');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

// Globals
const core = {
	addon: {
		name: 'ChromeUtils',
		id: 'ChromeUtils@jetpack',
		path: {
			name: 'chromeutils',
			content: 'chrome://chromeutils/content/',
			images: 'chrome://chromeutils/content/resources/images/',
			locale: 'chrome://chromeutils/locale/',
			resources: 'chrome://chromeutils/content/resources/',
			modules: 'chrome://chromeutils/content/modules/',
			scripts: 'chrome://chromeutils/content/resources/scripts/',
			styles: 'chrome://chromeutils/content/resources/styles/'
		}
	},
	os: {
		name: OS.Constants.Sys.Name.toLowerCase(),
		toolkit: Services.appinfo.widgetToolkit.toLowerCase(),
		xpcomabi: Services.appinfo.XPCOMABI
	},
	firefox: {
		pid: Services.appinfo.processID,
		version: Services.appinfo.version
	}
};

var PromiseWorker;
var bootstrap = this;

// Lazy Imports
const myServices = {};
XPCOMUtils.defineLazyGetter(myServices, 'sl', function () { return Cc['@mozilla.org/moz/jssubscript-loader;1'].getService(Ci.mozIJSSubScriptLoader); });
XPCOMUtils.defineLazyGetter(myServices, 'hph', function () { return Cc['@mozilla.org/network/protocol;1?name=http'].getService(Ci.nsIHttpProtocolHandler); });
XPCOMUtils.defineLazyGetter(myServices, 'sb', function () { return Services.strings.createBundle(core.addon.path.locale + 'bootstrap.properties?' + Math.random()); /* Randomize URI to work around bug 719376 */ });

function extendCore() {
	// adds some properties i use to core based on the current operating system, it needs a switch, thats why i couldnt put it into the core obj at top
	switch (core.os.name) {
		case 'winnt':
		case 'winmo':
		case 'wince':
			core.os.version = parseFloat(Services.sysinfo.getProperty('version'));
			// http://en.wikipedia.org/wiki/List_of_Microsoft_Windows_versions
			if (core.os.version == 6.0) {
				core.os.version_name = 'vista';
			}
			if (core.os.version >= 6.1) {
				core.os.version_name = '7+';
			}
			if (core.os.version == 5.1 || core.os.version == 5.2) { // 5.2 is 64bit xp
				core.os.version_name = 'xp';
			}
			break;
			
		case 'darwin':
			var userAgent = myServices.hph.userAgent;
			//console.info('userAgent:', userAgent);
			var version_osx = userAgent.match(/Mac OS X 10\.([\d\.]+)/);
			//console.info('version_osx matched:', version_osx);
			
			if (!version_osx) {
				throw new Error('Could not identify Mac OS X version.');
			} else {
				var version_osx_str = version_osx[1];
				var ints_split = version_osx[1].split('.');
				if (ints_split.length == 1) {
					core.os.version = parseInt(ints_split[0]);
				} else if (ints_split.length >= 2) {
					core.os.version = ints_split[0] + '.' + ints_split[1];
					if (ints_split.length > 2) {
						core.os.version += ints_split.slice(2).join('');
					}
					core.os.version = parseFloat(core.os.version);
				}
				// this makes it so that 10.10.0 becomes 10.100
				// 10.10.1 => 10.101
				// so can compare numerically, as 10.100 is less then 10.101
				
				//core.os.version = 6.9; // note: debug: temporarily forcing mac to be 10.6 so we can test kqueue
			}
			break;
		default:
			// nothing special
	}
	
	console.log('done adding to core, it is now:', core);
}

// START - Addon Functionalities
var ChromeUtils = {};
// myServices.sl.loadSubScript(core.addon.path.modules + 'ChromeUtils.js', ChromeUtils); // will not work here, must happen in `startup()` or later
// END - Addon Functionalities

function install() {}
function uninstall() {}

function startup(aData, aReason) {
	// core.addon.aData = aData;
	extendCore();

	myServices.sl.loadSubScript(core.addon.path.modules + 'ChromeUtils.js', ChromeUtils); // must do this in startup or afterwards, does not work before `startup()`
}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) { return }
}