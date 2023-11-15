window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", "G-NMKFWY2FG7");

window.onerror = function(message, script, line, column) {
	if(script.indexOf("emojimix") < 0 || script.indexOf(".js") < 0) return;
	console.log(script);
	if(navigator.onLine) {
		// message += " " + script;
		gtag("event", message, {event_category: "Error", event_label: line + ":" + column});
		alert("Error while loading emojimix.\nYour device might not be supported.\n\n" + message + "\n" + line + ":" + column);
	}
	document.documentElement.remove();
}

longLoadTimeout = window.setTimeout(function() {
	gtag("event", "Long load", {event_category: "Error"});
	alert("Error while loading emojimix");
	document.documentElement.remove();
}, 1e5);