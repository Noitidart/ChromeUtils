succesful tests:
window.focus(); setTimeout(function() { scope.ChromeUtils.EventUtils.synthesizeKey('c', {ctrlKey:true}, window); console.log('sent'); }, 1000);
window.focus(); setTimeout(function() { scope.ChromeUtils.EventUtils.synthesizeKey('VK_ALT', {}, window); console.log('sent'); }, 1000);
scope.ChromeUtils.EventUtils.sendChar('e', aContentWindow)
scope.ChromeUtils.EventUtils.sendChar('E', aContentWindow)
window.focus(); setTimeout(function() { scope.ChromeUtils.synthesizeDrop(gBrowser.contentDocument.getElementById('rawr'), gBrowser.contentDocument.getElementById('rawr'), [[{type: "text/plain", data: "hi there"}]], "copy", window, aContentWindow); console.log('sent'); }, 1000); // window MUST be nsIDOMWindow NOT a content window otherwise get error of: `"TypeError: aDataTransfer is undefined` the issue is because the drag is not firing, if i change from input element to image element then it works. so the issue with drag is, addEventListener to dragSrc to ensure dragStart triggers, see example code below, if it doesnt trigger then it wont work.  you get the `aDataTransfer undefined` error
scope.ChromeUtils.synthesizeDrop(gBrowser.contentDocument.getElementById('rawr'), gBrowser.contentDocument.getElementById('rawr'), [[{type: "text/plain", data: "hi there"}]], "copy", window, aContentWindow); console.log('sent'); // window MUST be nsIDOMWindow NOT a content window otherwise get error of: `"TypeError: aDataTransfer is undefined`

var XPIScope = Cu.import('resource://gre/modules/addons/XPIProvider.jsm');
var scope = XPIScope.XPIProvider.bootstrapScopes['ChromeUtils@jetpack'];

function sendTwitterDropEvent() {
	
	var aContentWindow = gBrowser.contentWindow;
	var aContentDocument = aContentWindow.document;

	var dragSrc = aContentDocument.createElement('div');
	dragSrc.style.backgroundColor = 'steelblue';
	dragSrc.style.zIndex = '11'; // enough to blocks whats underneath so starts the drag
	dragSrc.style.width = '100px';
	dragSrc.style.height = '100px';
	dragSrc.style.position = 'absolute';
	dragSrc.style.display = 'block';
	dragSrc.setAttribute('draggable', true);
	
	dragSrc.addEventListener('dragstart', function() {
		console.error('GOOD drag started');
	}, false);
	
	var btnNewTweet = aContentDocument.getElementById('global-new-tweet-button');
	console.info('btnNewTweet:', btnNewTweet);
	if (!btnNewTweet) {
		throw new Error('global tweet button not found, probably not logged in');
	}

	btnNewTweet.click();

	var inputAddPhoto = aContentDocument.getElementById('global-tweet-dialog').querySelector('input[type=file]');
	if (!inputAddPhoto) {
		throw new Error('add photo button not found! i have no idea what could cause this');
	}

	var formTweet = aContentDocument.getElementById('global-tweet-dialog-dialog').querySelector('form'); //<form.t1-form.tweet-form has-preview has-thumbnail dynamic-photos photo-square-4>
	if (!formTweet) {
		throw new Error('tweet form not found! i have no idea what could cause this');
	}
	console.info('formTweet:', formTweet);
	
	formTweet.parentNode.appendChild(dragSrc);
	scope.ChromeUtils.synthesizeDrop(dragSrc, formTweet, [[{type: "text/plain", data: "sAAAAA"}]], "copy", aContentWindow, aContentWindow);
	
	//setTimeout(function() {
		formTweet.parentNode.removeChild(dragSrc);
	//}, 3000);
}

sendTwitterDropEvent();