// All code property of Tikolu (tikolu.net)
// Feel free to use or modify this code, but please link to tikolu.net/emojimix

const API = "https://www.gstatic.com/android/keyboard/emojikitchen/";

const loadSection = document.getElementById("load-section");

const nav = document.querySelector("nav");
const scroller = document.getElementById("scroller");

const mainSection = document.querySelector("main");
const informationDisplay = document.getElementById("information");
const output = document.getElementById("output");
output.container = document.getElementById("emoji-display")
const errorDisplay = document.getElementById("sad-turtle");

const infoPopup = document.getElementById("info-popup");
const settingsPopup = document.getElementById("settings-popup");

const bottomLinks = document.getElementById("bottom-links");

function popupOpen() {
	this.hidden = false;
	gtag("event", "Popup open", {event_category: "General", event_label: this.id});
}

settingsPopup.open = popupOpen;
infoPopup.open = popupOpen;

document.querySelectorAll(".popup").forEach(popup => {
	popup.onanimationend = event => {
		if(popup.classList.contains("fade-out")) {
			popup.classList.remove("fade-out");
			popup.hidden = true;
		}
	};
});

const soundSwitch = document.getElementById("sound-switch");
const vibrationSwitch = document.getElementById("vibration-switch");
const animationSwitch = document.getElementById("animation-switch");
const themeSelection = document.getElementById("theme-select") || soundSwitch;

soundSwitch.onclick = () => {
	storageSave("emojimixSoundOn", soundSwitch.classList.toggle("on"));
	vibration(20);
}

vibrationSwitch.onclick = () => {
	if(!navigator.vibrate) return alert("Vibrations are not supported by your web browser");
	storageSave("emojimixVibrationOn", vibrationSwitch.classList.toggle("on"));
	vibration(20);
}

animationSwitch.onclick = () => {
	storageSave("emojimixAnimationOn", animationSwitch.classList.toggle("on"));
	getEmojis();
	vibration(20);
}

themeSelection.onchange = () => {
	storageSave("emojimixTheme", themeSelection.value);
	themeObserver.onchange();
}

output.onanimationend = event => {
	event.target.hidden = event.target.classList.contains("hiding");
	event.target.classList.remove("hiding");
};
informationDisplay.onanimationend = output.onanimationend;

document.oncontextmenu = event => event.preventDefault();

const searchPopup = document.getElementById("search-popup");
searchPopup.error = document.getElementById("search-popup-error");
searchPopup.content = document.getElementById("search-popup-content");
searchPopup.input = document.getElementById("search-box");

searchPopup.show = slider => {
	document.location.hash = "search";
	shuffling = 0;
	mainSection.style.pointerEvents = "none";
	setTimeout(() => {
		window.onhashchange = searchPopup.hide;
		document.onclick = searchPopup.hide;
		// searchPopup.input.scrollIntoView();
	}, 100);
	lastInteracted = slider;
	searchPopup.input.value = "";
	searchPopup.content.innerHTML = "";
	emojis.forEach((emoji, index) => {
		let div = document.createElement("div");
		div.style.backgroundImage = `url("${emoji[3]}")`;
		div.setAttribute("emoji-index", index);
		searchPopup.content.appendChild(div);
	});
	searchPopup.error.hidden = true;
	searchPopup.hidden = false;
	searchPopup.input.focus();
	searchPopup.content.scrollTop = 0;
}

searchPopup.hide = () => {
	window.onhashchange = undefined;
	document.location.hash = "";
	searchPopup.input.blur();
	searchPopup.classList.add("fade-out");
	mainSection.style.pointerEvents = "all";
	document.onclick = undefined;
}

searchPopup.content.onclick = event => {
	let index = event.target.getAttribute("emoji-index");
	if(!index) return;
	vibration(20);
	searchPopup.hide();
	lastInteracted.goTo(index, true);
	// output.classList.add("hiding");
	// setTimeout(() => lastInteracted.goTo(index, true), 100);
	if(searchPopup.input.value) gtag("event", "Search", {event_category: "General", event_label: searchPopup.input.value + ": " + codePointsToEmoji(emojis[index][0])});
}

searchPopup.input.onkeydown = event => {
	event.stopPropagation();
	if(event.key == "Enter") {
		let el = searchPopup.content.querySelector("div:not([hidden])");
		if(el) el.click();
		return;
	}
	if(event.key == "Backspace" && searchPopup.input.value.length == 0) return searchPopup.hide();
	searchPopup.error.hidden = false;
	let v = searchPopup.input.value.toLowerCase().trim().split(" ");
	if(v.length = 1) for(index in emojis) if(codePointsToEmoji(emojis[index][0]) == v[0]) {
		searchPopup.input.value = "";
		lastInteracted.goTo(index, true);
		return searchPopup.hide();
	}
	searchPopup.content.childNodes.forEach((div, index) => {
		div.hidden = true;
		div.classList.add("unanimated");
		if(v.some(a => emojis[index][2].every(s => !s.startsWith(a) && !a.startsWith(s)))) return;
		div.hidden = false;
		searchPopup.error.hidden = true;
	});
	searchPopup.content.scrollTop = 0;
}
searchPopup.input.oninput = searchPopup.input.onkeydown;

searchPopup.onclick = event => event.stopPropagation();

const sliders = [document.getElementById("slider1"), document.getElementById("slider2")];

sliders[0].randomButton = document.getElementById("random1");
sliders[1].randomButton = document.getElementById("random2");

sliders[0].scrollFixed = false;
sliders[1].scrollFixed = false;

sliders[0].goTo = (index, instant = false) => sliders[0].scrollTo({top: index * (vh / 14), left: 0, behavior: instant ? "auto" : "smooth"});
sliders[1].goTo = (index, instant = false) => sliders[1].scrollTo({top: index * (vh / 14), left: 0, behavior: instant ? "auto" : "smooth"});

sliders[0].random = manual => {
	if(shuffling == 2) shuffling = 3;
	if(manual && (shuffling == 1 || (sliders[0].randomButton.classList.contains("active") && manual))) return stopShuffling();
	if(shuffling == 0) shuffling = 1;
	sliders[0].randomButton.classList.add("active");
	sliders[0].goTo(Math.floor(Math.random() * emojis.length));
	if(manual) gtag("event", "Shuffle", {event_category: "General", event_label: shuffling});
}

sliders[1].random = manual => {
	if(manual && (shuffling == 2 || sliders[1].randomButton.classList.contains("active"))) return stopShuffling();
	if(shuffling == 1) shuffling = 3;
	if(shuffling == 0) shuffling = 2;
	sliders[1].randomButton.classList.add("active");
	sliders[1].goTo(Math.floor(Math.random() * emojis.length));
	if(manual) gtag("event", "Shuffle", {event_category: "General", event_label: shuffling});
}

const codePointsToEmoji = codepoints => codepoints.reduce((p, c) => p + String.fromCodePoint(c), "");

const getUrlEmojis = () => {
	let url = decodeURI(document.location.href).substring(28);
	if(url.includes("?")) url = url.substring(0, url.indexOf("?"));
	if(url.includes("#")) url = url.substring(0, url.indexOf("#"));
	return url;
}

const vibration = pattern => {
	if(!navigator.vibrate) return;
	if(!storageLoad("emojimixVibrationOn", true)) return;
	navigator.vibrate(pattern);
}

const storageLoad = (name, defaultValue) => {
	let value = localStorage.getItem(name);
	value = JSON.parse(value);
	if(value === null) return defaultValue;
	else return value;
}

const storageSave = (name, value) => {
	localStorage.setItem(name, JSON.stringify(value));
}

soundSwitch.classList.toggle("on", storageLoad("emojimixSoundOn", true));
vibrationSwitch.classList.toggle("on", navigator.vibrate && storageLoad("emojimixVibrationOn", true));
vibrationSwitch.classList.toggle("on", storageLoad("emojimixAnimationOn", true));
themeSelection.value = storageLoad("emojimixTheme", "system");

const heartButton = document.getElementById("heart-button");
heartButton.update = () => heartButton.classList.toggle("full", favourites.includes(getUrlEmojis()));

var shuffling = 0;
output.onload = () => {
	if(!loadSection.hidden) finishLoad();
	stopShuffling();
	output.classList.remove("hiding");
	output.hidden = false;
	heartButton.update();
	if(tutorial.state == 0) tutorial.advance();
};

var shuffled = false;

const shuffleSliders = () => {
	vibration([20, 20, 20]);
	shuffling = 3;
	sliders[0].random();
	sliders[1].random();
	gtag("event", "Shuffle", {event_category: "General", event_label: 3});
	
};

const stopShuffling = () => {
	document.querySelectorAll(".button.random").forEach(button => {
		button.onanimationiteration = () => {
			button.onanimationiteration = undefined;
			button.classList.remove("active");
		};
	});
	shuffling = 0;
	sliders[0].scrollTop = sliders[0].scrollTop;
	sliders[1].scrollTop = sliders[1].scrollTop;
};

output.container.onclick = () => {
	heartButton.classList.remove("full");
	output.classList.add("hiding");
	shuffled = true;
	shuffleSliders();
};

var unswapped = [];
const createURL = (emoji1, emoji2, direct=false, swap=false) => {
	if(!emoji1) emoji1 = 0;
	if(!emoji2) emoji2 = 0;
	if(typeof emoji1 == "number") emoji1 = emojis[emoji1];
	if(typeof emoji2 == "number") emoji2 = emojis[emoji2];
	let u1 = emoji1[0].map(c => "u" + c.toString(16)).join("-");
	let u2 = emoji2[0].map(c => "u" + c.toString(16)).join("-");
	unswapped = [codePointsToEmoji(emoji1[0]), codePointsToEmoji(emoji2[0])];
	if(!direct) {
		let url = `https://tikolu.net/emojimix/${swap ? unswapped[1] : unswapped[0]}+${swap ? unswapped[0] : unswapped[1]}`;
		try {
			history.replaceState(undefined, "", url);
		} catch(error) {
			document.location.href = url;
		}
		storageSave("emojimixLastCombination", getUrlEmojis());
	}
	let d = emoji1[1];
	return `${API}${d}/${u1}/${u1}_${u2}.png`;
};

const mixEmojis = (emoji1, emoji2) => {
	output.removeAttribute("fake", true);
	output.onerror = error => {
		output.src = createURL(emoji2, emoji1, false, true);
		output.onerror = async () => {
			createURL(emoji1, emoji2);
			output.onerror = undefined;
			if(navigator.onLine) {
				output.setAttribute("fake", true);
				output.src = await createFakeMix(emoji1, emoji2);
			} else {
				output.hidden = true;
				errorDisplay.hidden = false;
				vibration([50, 50, 200]);
			}
		};
	};
	output.src = createURL(emoji1, emoji2);
}

const createFakeMix = (emoji1, emoji2) => new Promise(async resolve => {
	let canvas = document.createElement("canvas");
	canvas.width = 534;
	canvas.height = 534;
	canvas.ctx = canvas.getContext("2d");
	canvas.drawURL = (url, x, y, w, h) => new Promise((resolve, reject) => {
		let img = document.createElement("img");
		img.onload = () => {
			canvas.ctx.drawImage(img, x, y, w, h);
			resolve();
		}
		img.onerror = reject;
		img.src = url;
	});
	if(backgroundEmojis.some(e => e.every(s => emoji2[2].includes(s)))) [emoji2, emoji1] = [emoji1, emoji2];
	await canvas.drawURL(emoji1[3], 0, 0, 534, 534);
	canvas.ctx.shadowColor = "black";
	canvas.ctx.shadowBlur = 0;
	await canvas.drawURL(emoji2[3], 142, 142, 250, 250);
	canvas.toBlob(blob => resolve(URL.createObjectURL(blob)));
});

var audio;
if(typeof AudioContext != "undefined") {
	audio = new AudioContext();
	audio.gainNode = audio.createGain();
	audio.gainNode.gain.value = 0.5;
	audio.gainNode.connect(audio.destination);
}

const beep = (hz, ms, type="sine") => {
	if(!audio) return;
	let oscillator = audio.createOscillator();
	oscillator.type = type;
	oscillator.frequency.value = hz;
	oscillator.connect(audio.gainNode);
	oscillator.start();
	oscillator.stop(audio.currentTime + ms/1000);
}

const getEmojis = id => {
	if(!sliders[0].scrollTop) sliders[0].scrollTop = 0;
	if(!sliders[1].scrollTop) sliders[1].scrollTop = 0;
	let emoji1 = Math.round(sliders[0].scrollTop / (vh / Math.floor(document.location.origin.length / 1.25) * sc));
	let emoji2 = Math.round(sliders[1].scrollTop / (vh / Math.floor(document.location.origin.length / 1.25) * sc));

	[...document.querySelectorAll(".slider > div.selected")].forEach(div => {
		div.classList.remove("selected");
		let img = div.querySelector("img");
		if(!img) return;
		img.src = img.srcOriginal || img.src;
	});
	
	let emojiElements = sliders.map((s, i) => s.querySelector(`div[emoji-id="${[emoji1, emoji2][i]}"]`));
	emojiElements.forEach(e => {
		e.classList.add("selected");
		if(!storageLoad("emojimixAnimationOn", true)) return;
		let img = e.querySelector("img");
		if(!img || !img.src) return;
		img.srcOriginal = img.src;
		let webp = `https://fonts.gstatic.com/s/e/notoemoji/latest/${img.src.replace(/^.*emojis\//, "").replace(/.svg$/, "")}/512.webp`;
		fetch(webp).then(response => {
			if(!response.ok) return;
			img.src = webp;
		});
	});

	if(!id) emoji1 = emojis[emoji1], emoji2 = emojis[emoji2];
	errorDisplay.hidden = true;
	return [emoji1, emoji2];
}

const sliderClick = function(event) {
	lastInteracted = this;
	let clickedOn = event.target.getAttribute("emoji-id");
	if(!clickedOn) return;
	let currentEmoji = getEmojis(true)[this == sliders[0] ? 0 : 1];
	if(currentEmoji == clickedOn) return;
	this.goTo(currentEmoji + (currentEmoji < clickedOn ? 1 : - 1));
}

sliders[0].onclick = sliderClick;
sliders[1].onclick = sliderClick;

var scrollTimeout, lastScrollPosition, vibrationTracker, lastEmojis, sessionSuccessCounter = 0, beepAllowed = false, lastInteracted = sliders[0];
const scroll = event => {
	if(!loadSection.hidden) return;
	lastInteracted = event.target;
	if((lastScrollPosition < event.target.scrollTop && vibrationTracker > Math.round(event.target.scrollTop % (vh / 14))) || (lastScrollPosition > event.target.scrollTop && vibrationTracker < Math.round(event.target.scrollTop % (vh / 14)))) {
		vibration(10);
		if(storageLoad("emojimixSoundOn", true) && beepAllowed && !shuffling) beep(1e3, 1);
	}
	vibrationTracker = Math.round(event.target.scrollTop % (vh / 14));
	lastScrollPosition = event.target.scrollTop;
	if(btoa(document.location.origin).length != 24) return;
	clearTimeout(scrollTimeout);
	scrollTimeout = setTimeout(() => {
		let currentEmojis = getEmojis();
		if(lastEmojis && JSON.stringify(currentEmojis) == JSON.stringify(lastEmojis)) return;
		heartButton.classList.remove("full");
		output.classList.add("hiding");
		lastEmojis = currentEmojis;
		mixEmojis(...currentEmojis);
	}, 500);
};

let vh = 0, sc = 1;
window.onresize = () => {
	if(!searchPopup.hidden && !searchPopup.classList.contains("fade-out")) return;
	vh = window.innerHeight;
	document.documentElement.style.setProperty("--vh", `${vh}px`);
	document.documentElement.scrollTop = 0;
	document.documentElement.scrollLeft = 0;
	if(/Android.+Firefox/.test(navigator.userAgent)) {
		sc = 0.99;
		document.documentElement.style.setProperty("--fc", 36);
	}
}
window.onresize();

const themeObserver = window.matchMedia("(prefers-color-scheme: dark)");
themeObserver.onchange = () => {
	let chosenTheme = storageLoad("emojimixTheme", "system");
	document.body.classList.toggle("dark", chosenTheme == "system" ? themeObserver.matches : chosenTheme == "dark");
	bottomLinks.hidden = true;
	setTimeout(() => bottomLinks.hidden = false, 500);
}
themeObserver.onchange();

document.onkeydown = event => {
	if(shuffling) return;
	if(tutorial.state == 0 && event.key == " ") tutorial.highlight.click();
	if(tutorial.state > -1) return;
	if(event.key == " " && searchPopup.hidden) {
		event.preventDefault();
		output.container.click();
	} else if(event.key == "ArrowDown") {
		event.preventDefault();
		lastInteracted.scrollTop += vh / 14;
	} else if(event.key == "ArrowUp") {
		event.preventDefault();
		lastInteracted.scrollTop -= vh / 14;
	}
}

if(navigator.serviceWorker) navigator.serviceWorker.register("worker.js", {scope:"/emojimix/"});

sliders[0].onscroll = scroll;
sliders[1].onscroll = scroll;

searchButtonClick = (event, slider) => {
	if(event.target.classList.contains("active")) {
		searchBox.close()
	} else {
		searchBox.close();
		searchBox.open(slider);
	}
};

nav.onclick = event => {
	clearTimeout(scroller.timeout);
	scroller.timeout = 0;
	if(event.target.tagName != "A") return;
	vibration(10);
	if(event.target == nav.children[0]) {
		scroller.scrollTo({top: 0, left: 0, behavior: "smooth"});
	} else if(event.target == nav.children[1]) {
		scroller.scrollTo({top: 0, left: window.innerWidth, behavior: "smooth"});
	}
}

scroller.timeout = 0;
scroller.onscroll = () => {
	let v = scroller.scrollLeft / scroller.clientWidth + 1;
	nav.style.setProperty("--v", v);
	if(scroller.timeout) clearInterval(scroller.timeout);
	scroller.timeout = setTimeout(() => {
		scroller.timeout = 0;
		if(v > 1.9) {
			nav.children[0].classList.remove("selected");
			nav.children[1].classList.add("selected");
			if(tutorial.state == 1) {
				storageSave("emojimixGlobalFavourites", true);
				favouritesGrid.render();
				setTimeout(() => tutorial.hidden = true, 500);
			}
		} else if(v == 1) {
			nav.children[1].classList.remove("selected");
			nav.children[0].classList.add("selected");
			globalSwitch.update();
			if(tutorial.state == 1) {
				tutorial.advance();
				storageSave("emojimixGlobalFavourites", false);
			}
		}
	}, 250);
}

const favouritesGrid = document.getElementById("favourites-grid");

const globalSwitch = document.getElementById("global-switch");
const categorySelection = document.getElementById("category-selection");

const refreshButton = document.getElementById("refresh-global");

refreshButton.onclick = () => {
	if(refreshButton.classList.contains("spin")) return;
	vibration(30);
	refreshButton.classList.add("spin");
	setTimeout(() => refreshButton.classList.remove("spin"), 1e3);
	favouritesGrid.render();
}

categorySelection.update = () => {
	categorySelection.querySelectorAll("div").forEach(category => category.classList.remove("selected"));
	categorySelection.querySelector(`[target-category=${storageLoad("emojimixChosenCategory", "day")}]`).classList.add("selected");
}
categorySelection.update();

categorySelection.onclick = event => {
	let currentCategory = storageLoad("emojimixChosenCategory", "day");
	let targetCategory = event.target.getAttribute("target-category");
	if(!targetCategory || targetCategory == currentCategory) return;
	storageSave("emojimixChosenCategory", targetCategory);
	vibration(10);
	favouritesGrid.render();
}

const resetCountdown = document.getElementById("reset-countdown");
resetCountdown.update = () => {
	let ms = resetCountdown.left - (Date.now() - resetCountdown.start);
	if(ms <= 0) {
		ms = 0;
		if(!favouritesGrid.querySelector("#heartbroken-turtle")) heartBrokenTurtle("Nothing favourited yet");
	}
	let s = Math.floor(ms / 1000);
	let m = Math.floor(s / 60);
	s -= m * 60; 
	let h = Math.floor(m / 60);
	m -= h * 60;
	if(h < 10) h = `0${h}`;
	if(m < 10) m = `0${m}`;
	if(s < 10) s = `0${s}`;
	let text = h > 0 ? h + ":" : "";
	text += `${m}:${s}`;
	let current = resetCountdown.getAttribute("countdown-content");
	if(current == text) return;
	resetCountdown.setAttribute("countdown-content", text);
}

resetCountdown.cancel = () => {
	resetCountdown.classList.remove("show");
	clearInterval(resetCountdown.interval);
}

const downloadTopEmojis = async start => {
	if(favouritesGrid.downloading) return;
	favouritesGrid.downloading = true;
	let response = await fetch("heart", {method: "POST", body: JSON.stringify({
		action: "load",
		table: storageLoad("emojimixChosenCategory", "day"),
		start: start
	})});
	response = await response.json();
	favouritesGrid.classList.remove("loader");
	if(favouritesGrid.innerHTML == "" && (!response.emojis || response.emojis.length == 0)) {
		heartBrokenTurtle("No favourites found");
		return;
	}
	resetCountdown.cancel();
	if(response.reset) {
		resetCountdown.start = Date.now();
		resetCountdown.left = response.reset;
		resetCountdown.classList.add("show");
		resetCountdown.interval = setInterval(resetCountdown.update, 100);
		resetCountdown.update();
	}
	let startIndex = favouritesGrid.lastChild ? favouritesGrid.lastChild.getAttribute("emoji-position") : 0;
	let lastAmount = favouritesGrid.lastChild ? favouritesGrid.lastChild.getAttribute("emoji-counter") : 0;
	let counter = startIndex;
	response.emojis.forEach((emoji, index) => {
		let codepoints = emoji[0].map(c => c.split("_").map(c => parseInt(c, 16)));
		codepoints = codepoints.map(c => emojis.findIndex(a => JSON.stringify(a[0]) == JSON.stringify(c)));
		emoji[1] = emoji[1].toString();
		let div = document.createElement("div");
		div.classList.add("global-emoji");
		if(emoji[1] != lastAmount) counter++;
		div.innerHTML = `<div class="global-position"${emoji[1] == lastAmount ? " hidden" : ""}>#${counter}</div>`;
		let displayAmount = emoji[1].split("").reduce((a, b, c, d) => `${a}${(d.length - c) % 3 == 0 ? "," : ""}${b}`);
		div.innerHTML += `<div class="global-counter">${displayAmount}</div>`;
		if(emoji[1] != lastAmount) lastAmount = emoji[1];
		div.setAttribute("emoji-set", codepoints.join(","));
		div.style.animationDelay = `${200 + (index * 100)}ms`;
		div.style.backgroundImage = `url("${createURL(...codepoints, true)}")`;
		div.setAttribute("emoji-string", emoji[0].join("+"));
		div.setAttribute("emoji-position", counter);
		div.setAttribute("emoji-counter", emoji[1]);
		if(index + 1 == response.emojis.length) div.onanimationend = () => {
			favouritesGrid.downloading = false;
			favouritesGrid.onscroll();
		}
		favouritesGrid.appendChild(div);
	});
}

const heartBrokenTurtle = message => favouritesGrid.innerHTML = `<div id="heartbroken-turtle"></div><p>${message}</p>`;

favouritesGrid.render = async () => {
	resetCountdown.cancel();
	favouritesGrid.innerHTML = "";
	favouritesGrid.classList.remove("fade-out");
	if(!navigator.onLine) return heartBrokenTurtle("No connection");
	if(storageLoad("emojimixGlobalFavourites", false)) {
		refreshButton.classList.remove("hidden");
		categorySelection.classList.remove("hidden");
		categorySelection.update();
		favouritesGrid.downloading = false;
		favouritesGrid.classList.add("loader");
		await downloadTopEmojis();
	} else {
		refreshButton.classList.add("hidden");
		categorySelection.classList.add("hidden");
		if(favourites.length == 0) return heartBrokenTurtle("Nothing favourited yet");
		favourites.forEach((favourite, index) => {
			let emojiSet = parseEmojiSet(favourite);
			let div = document.createElement("div");
			div.className = "saved-emoji";
			div.innerHTML = `<div class="delete-button"></div>`;
			div.setAttribute("emoji-set", emojiSet.join(","));
			div.style.animationDelay = `${200 + (index * 50)}ms`;
			div.style.backgroundImage = `url("${createURL(...emojiSet, true)}")`;
			favouritesGrid.appendChild(div);
		});
	}
}

favouritesGrid.clearDeletable = () => document.querySelectorAll(".saved-emoji").forEach(emoji => emoji.classList.remove("deletable"));

favouritesGrid.onclick = event => {
	favouritesGrid.clearDeletable();
	if(event.target.classList.contains("delete-button")) {
		let emojiSet = event.target.parentElement.getAttribute("emoji-set");
		let index = favourites.findIndex(favourite => parseEmojiSet(favourite).join(",") == emojiSet);
		favourites.splice(index, 1);
		event.target.parentElement.classList.add("hiding");
		setTimeout(() => {
			event.target.parentElement.remove();
			if(favourites.length == 0) favouritesGrid.render();
		}, 250);
		vibration([40, 80, 40]);
		storageSave("emojimixFavourites", favourites);
		return heartButton.update();
	} else if(event.target.classList.contains("saved-emoji") || event.target.classList.contains("global-emoji")) {
		let emojiSet = event.target.getAttribute("emoji-set").split(",").map(a => parseInt(a));
		if(JSON.stringify(parseEmojiSet(getUrlEmojis())) != JSON.stringify(emojiSet)) {
			output.classList.add("hiding");
			sliders[0].goTo(emojiSet[0], true);
			sliders[1].goTo(emojiSet[1], true);
		}
		nav.children[0].click();
		let logData = {event_category: "Catalogue"};
		logData.event_label = storageLoad("emojimixGlobalFavourites", false) ? "global " : "personal";
		if(logData.event_label.startsWith("global")) {
			logData.event_label += storageLoad("emojimixChosenCategory", "day");
			logData.value = event.target.getAttribute("emoji-position");
		}
		gtag("event", "Open favourite", logData);
	}
}

favouritesGrid.oncontextmenu = event => {
	event.stopPropagation();
	event.preventDefault();
	favouritesGrid.clearDeletable();
	if(!event.target.classList.contains("saved-emoji") || event.target.classList.contains("global-emoji")) return;
	vibration(40);
	event.target.classList.add("deletable");
	gtag("event", "Open favourite", {event_category: "Catalogue"});
}

favouritesGrid.onscroll = () => {
	if(!storageLoad("emojimixGlobalFavourites", false) || favouritesGrid.childElementCount == 0) return;
	if(favouritesGrid.scrollTop < favouritesGrid.scrollHeight - (favouritesGrid.clientHeight * 3)) return;
	downloadTopEmojis([favouritesGrid.lastChild.getAttribute("emoji-string"), favouritesGrid.lastChild.getAttribute("emoji-counter")]);
}

globalSwitch.update = () => {
	globalSwitch.classList.toggle("on", storageLoad("emojimixGlobalFavourites", false));
}
globalSwitch.update();

globalSwitch.onclick = () => {
	vibration(10);
	storageSave("emojimixGlobalFavourites", !storageLoad("emojimixGlobalFavourites", false));
	globalSwitch.update();
	favouritesGrid.classList.add("fade-out");
	categorySelection.classList.add("hidden");
	refreshButton.classList.add("hidden");
	resetCountdown.cancel();
	setTimeout(favouritesGrid.render, 250);
}

const showMessage = message => {
	clearTimeout(informationDisplay.timeout);
	informationDisplay.innerText = message;
	informationDisplay.hidden = false;
	informationDisplay.timeout = setTimeout(() => {
		informationDisplay.classList.add("hiding");
	}, 1500);
};

const imageToBlob = async () => {
	let response = await fetch(`${output.src.startsWith("blob") ? "" : "get/"}${output.src}`, {headers: {"x-v": 1}});
	let arrayBuffer = await response.arrayBuffer();
	return new Blob([arrayBuffer], {type: "image/png"});
};

const triggerDownload = event => {
	event.preventDefault();
	if(confirm("Download image instead of copying?")) downloadImage();
	gtag("event", "Download", {event_category: "Additional"});
}

const downloadImage = async () => {
	let a = document.createElement("a");
	a.href = URL.createObjectURL(await imageToBlob());
	a.download = `emojimix_${getUrlEmojis().replaceAll("+", "_")}.png`;
	a.click();
};

const copyImage = async () => {
	if(output.hidden) return;
	if(!navigator.clipboard || typeof ClipboardItem == "undefined") {
		showMessage("Your browser does not support copying images. Downloading instead...");
		gtag("event", "Download fallback", {event_category: "Sharing"});
		return setTimeout(downloadImage, 1000);
	}
	try {
		showMessage("Copying...");
		let clipboardData = new ClipboardItem({"image/png": await imageToBlob()});
		await navigator.clipboard.write([clipboardData]);
		showMessage("Copied image!");
		gtag("event", "Copy image", {event_category: "Sharing"});
	} catch(error) {
		showMessage("Error copying image. Downloading instead...");
		gtag("event", "Download fallback", {event_category: "Sharing"});
		return setTimeout(downloadImage, 1000);
	}
};

const copyLink = async () => {
	if(!navigator.clipboard) {
		showMessage("Your browser does not support copying");
		return;
	}
	try {
		await navigator.clipboard.writeText(`https://emoji.mx/${getUrlEmojis()}`);
		gtag("event", "Copy link", {event_category: "Sharing"});
		showMessage("Link copied!");
	} catch(error) {
		gtag("event", "Copy link error", {event_category: "Sharing"});
		showMessage("Error copying link");
	}
};

var favourites = storageLoad("emojimixFavourites", []);
var favouritesHistory = favourites.map(emoji => emoji);
heartButton.onclick = async () => {
	let url = unswapped.join("+");
	if(shuffling || output.hidden || output.getAttribute("fake")) {
		heartButton.classList.add("shake");
		return setTimeout(() => {
			if(tutorial.state == 2) tutorial.advance();
			heartButton.classList.remove("shake");
		}, 200);
	}
	if(favourites.includes(url) && tutorial.state != 2) {
		favourites.splice(favourites.indexOf(url), 1);
		storageSave("emojimixFavourites", favourites);
		heartButton.classList.remove("full");
		heartButton.classList.add("shake");
		setTimeout(() => heartButton.classList.remove("shake"), 200);
		vibration([40, 80, 40, 80, 40]);
		return !storageLoad("emojimixGlobalFavourites", false) && favouritesGrid.render();
	}
	heartButton.classList.add("bounce");
	setTimeout(() => {
		heartButton.classList.remove("bounce");
		nav.children[1].classList.add("bounce");
		setTimeout(() => {
			nav.children[1].classList.remove("bounce");
			if(tutorial.state == 2) tutorial.advance();
		}, 500);
		vibration([20, 80, 20]);
	}, 500);
	output.container.classList.add("favourited");
	setTimeout(() => output.container.classList.remove("favourited"), 1000);
	heartButton.classList.toggle("full", true);
	if(!favourites.includes(url)) favourites.unshift(url);
	storageSave("emojimixFavourites", favourites);
	if(favouritesGrid.innerHTML != "" && !storageLoad("emojimixGlobalFavourites", false)) favouritesGrid.render();
	if(!favouritesHistory.includes(url)) {
		favouritesHistory.push(url);
		let emojiSet = parseEmojiSet(url);
		fetch("heart", {
			method: "POST",
			body: JSON.stringify({
				action: "save",
				emojis: emojiSet.map(index => emojis[index][0].map(c => c.toString(16)).join("_"))
			})
		});
	}
	gtag("event", "Save favourite", {event_category: "Catalogue"});
}

const shareButton = document.getElementById("share-button");
shareButton.onclick = async () => {
	if(!navigator.share) return showMessage("Your browser does not support sharing");
	try {
		showMessage("Sharing...");
		let url = `https://emoji.mx/${getUrlEmojis()}`;
		let shareData = {
			title: "emojimix by Tikolu",
			text: url
		};
		let imageShare = [new File([await imageToBlob()], "emojimix.png", {type: "image/png"})];
		if(navigator.canShare({files: imageShare})) shareData.files = imageShare;
		await navigator.share(shareData);
		gtag("event", "Share", {event_category: "Sharing"});
	} catch(error) {
		showMessage("Sharing cancelled");
		gtag("event", "Share cancel", {event_category: "Sharing"});
	}
};

const tutorial = document.getElementById("cover");
tutorial.text = document.getElementById("cover-text");
tutorial.highlight = document.getElementById("cover-circle");
tutorial.verb = window.innerWidth > window.innerHeight ? "Click" : "Tap";
tutorial.steps = [
	[`${tutorial.verb} here to shuffle`, 9, 16.5, 0, 4, 0, output.container],
	[`${tutorial.verb} “top” to view most popular combinations`, 2.3, 2.3, 5, 5, 0, nav.children[1]],
	["Save to favourites", 2, 33.8, 0, 14, 0, heartButton],
	["Share with your friends", 2, 33.8, 10.3, 14, 0, shareButton]
];
tutorial.highlight.onclick = () => {
	tutorial.classList.add("advance");
	if(!tutorial.steps[tutorial.state]) return tutorial.skip();
	if(tutorial.state + 1 <= tutorial.steps.length) tutorial.steps[tutorial.state][6].click();
	if(tutorial.state + 1 >= tutorial.steps.length) {
		tutorial.state = -1;
		setTimeout(() => {
			tutorial.hidden = true;
		}, 500);
		gtag("event", "Finish", {event_category: "Tutorial"});
	}
}
tutorial.skip = () => {
	tutorial.state = -1;
	tutorial.classList.add("advance");
	setTimeout(() => tutorial.hidden = true, 500);
	gtag("event", "Skip", {event_category: "Tutorial"});
}
tutorial.state = -1;
tutorial.advance = () => {
	tutorial.state++;
	if(tutorial.state >= tutorial.steps.length) return;
	let step = tutorial.steps[tutorial.state];
	tutorial.text.innerText = step[0];
	tutorial.highlight.style.setProperty("--radius", step[1] + "em");
	tutorial.highlight.style.setProperty("--top", step[2] + "em");
	tutorial.highlight.style.setProperty("--left", step[3] + "em");
	tutorial.text.style.setProperty("--top", step[4] + "em");
	tutorial.text.style.setProperty("--left", step[5] + "em");
	tutorial.hidden = false;
	tutorial.classList.remove("advance");
}
tutorial.restart = () => {
	tutorial.state = -1;
	nav.children[0].click();
	settingsPopup.classList.add("fade-out");
	sessionSuccessCounter = 0;
	tutorial.advance();
	gtag("event", "Restart", {event_category: "Tutorial"});
}

const resetStorage = () => {
	let amount = favourites.length;
	if(amount == 0) return alert("Nothing is favourited!");
	if(amount > 1 && !confirm(`Are you sure you want to remove all ${amount} favourites?`)) return;
	favourites = [];
	storageSave("emojimixFavourites", []);
	heartButton.update();
	favouritesGrid.render();
	alert(`${amount} favourite${amount > 1 ? "s" : ""} removed`);
	gtag("event", "Storage reset", {event_category: "Additional", value: amount});
}

const exportStorage = async  () => {
	if(favourites.length == 0) return alert("No favourites to export");
	let text = JSON.stringify(favourites).replace(/[^\x20-\x7F]/g, x => "\\u" + ("000" + x.codePointAt(0).toString(16)).slice(-4))
	text = `<${btoa(text).replaceAll("=", "")}>`;
	let info = "Paste this code to import your emojimix favourites to another device:\n";
	try {
		await navigator.clipboard.writeText(info + text);
		gtag("event", "Storage export", {event_category: "Additional", event_label: "clipboard"});
		alert(`${favourites.length} favourite${favourites.length == 1 ? "" : "s"} copied!`);
	} catch(error) {
		prompt(info, text);
		gtag("event", "Storage export", {event_category: "Additional", event_label: "prompt"});
	}
}

const importStorage = async  () => {
	let text, info = "No favourites found in pasted code";
	try {
		text = await navigator.clipboard.readText();
		gtag("event", "Storage import", {event_category: "Additional", event_label: "clipboard"});
	} catch(error) {
		text = prompt("Paste exported favourites below");
		gtag("event", "Storage import", {event_category: "Additional", event_label: "prompt"});
	}
	if(!text) return;
	text = text.match(/<[\w/]+>/);
	try {
		text = JSON.parse(atob(text[0].replace(/[<>]/g, "")));
	} catch(error) {
		return alert(info);
	}
	if(!text || !text.length) return alert(info);
	let alertState = favourites.length > 0 ? "before" : "skip";
	let i = 0, a = 0;
	text.forEach(favourite => {
		if(!parseEmojiSet(favourite)) return;
		if(favourites.includes(favourite)) return a++;
		if(alertState == "before") {
			if(confirm(`Imported favourites will be merged with ${favourites.length} existing favourite${favourites.length == 1 ? "" : "s"}. Continue?`)) alertState = "skip";
			else alertState = "after";
		}
		if(alertState == "after") return;
		favourites.push(favourite);
		i++;
	});
	if(alertState == "after") return;
	storageSave("emojimixFavourites", favourites);
	alert(`${i} favourite${i == 1 ? "" : "s"} imported${a > 0 ? `, ${a} already in favourites` : ""}`);
	heartButton.update();
	favouritesGrid.render();
}

const parseEmojiSet = set => {
	if(typeof set != "string") return set;
	set = set.split("+");
	if(set.length != 2) return undefined;
	set[0] = Array.from(set[0]).map(ch => ch.codePointAt(0)).join(" ");
	set[1] = Array.from(set[1]).map(ch => ch.codePointAt(0)).join(" ");
	emojis.forEach((emoji, index) => {
		if(emoji[0].join(" ") == set[0]) set[0] = index;
		if(emoji[0].join(" ") == set[1]) set[1] = index;
	});
	if(set[0] === "" || set[1] === "") return undefined;
	if(isNaN(set[0]) || isNaN(set[1])) return undefined;
	return set;
}

if(!document.location.origin.includes("tikolu.net")) throw "";
let accessType;
if(document.location.href.endsWith("?action=favourites")) nav.children[1].click();
else {
	if(document.location.href.endsWith("?action=pwa")) accessType = "pwa";
	else if(document.location.href.endsWith("?action=twa")) accessType = "twa";
	else if(document.location.href.endsWith("?action=amz")) accessType = "amz";
	else accessType = "web";
}
sessionStorage.setItem("emojimixAccessType", accessType);

const finishLoad = () => {
	clearInterval(longLoadTimeout);
	if(document.body) document.body.style.transition = "background-color 500ms, color 500ms";
	mainSection.hidden = false;
	loadSection.classList.add("fade-out");
	setTimeout(() => {
		beepAllowed = true;
		loadSection.hidden = true;
	}, 500);
	if(storageLoad("emojimixSuccessCounter", 0) == 0) setTimeout(tutorial.advance, 100);
	favouritesGrid.render();
	window.onresize();
}

let startFunction = () => {
	const bannedUserAgents = ["instagram", "musical_ly"];
	if(!document.location.origin.includes("tikolu.net") || bannedUserAgents.some(a => navigator.userAgent.toLowerCase().includes(a))) {
		window.location = "unsupported-browser";
		throw "";
	} else if(window.self != window.top) {
		document.documentElement.innerHTML = `
			<h2>This website has been stolen! Link to original:</h2>
			<a href="https://emoji.mx" target="_blank"><h1>emoji.mx</h1></a>
		`;
	}
	let urlEmojis = getUrlEmojis();
	if(urlEmojis) {
		if(!parseEmojiSet(urlEmojis)) alert("Invalid emojis!");
		else storageSave("emojimixLastCombination", urlEmojis);
	}
	emojis.forEach((emoji, index) => emojis[index].push(`emojis/${emoji[0].map(c => c.toString(16)).filter(c => c != "fe0f").join("_")}.svg`));
	mainSection.hidden = false;
	let startDIV = "<div><img></div>"
	sliders[0].innerHTML = emojis.reduce((html, emoji, index) => `${html}<div emoji-id="${index}"><img target-src="${emoji[3]}"></div>`, startDIV);
	sliders[0].innerHTML += startDIV;
	sliders[1].innerHTML = sliders[0].innerHTML;
	let lastCombination = parseEmojiSet(storageLoad("emojimixLastCombination", "🐢+🐱"));
	window.onload = () => {
		setTimeout(() => {
			sliders[0].goTo(lastCombination[0], true);
			sliders[1].goTo(lastCombination[1], true);
			mixEmojis(...getEmojis());
			[...document.querySelectorAll("[emoji-id] img")].forEach(image => {
				image.src = image.getAttribute("target-src");
				image.removeAttribute("target-src");
				setTimeout(() => image.removeAttribute("loading"), 1500);
			});
		}, 2000);
	};
};

startFunction();