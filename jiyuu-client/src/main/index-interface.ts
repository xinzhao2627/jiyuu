import { whitelist } from "./database/tableInterfaces";
export type whitelist_put_type = whitelist;

export type supported_browsers = {
	process_name: string;
	identifier: string[];
	finder_keywords: string[];
};

export type browsersList = {
	name: string;
	process: string;
	elapsedMissing: number;
	url: string;
};

export const emulators = [
	"hd-player",
	"bluestacksx",
	"nox",
	"dnplayer",
	"androidemulator",
	"memu",
	"nemuplayer",
];

export const unsupported_browsers = [
	{ name: "Comodo Dragon", process: "dragon" },
	{ name: "Yandex Browser", process: "browser" },
	{ name: "Vivaldi", process: "vivaldi" },
	{ name: "AvastBrowser", process: "AvastBrowser" },
	{ name: "internet_explorer", process: "iexplore" },
	{ name: "waterfox", process: "waterfox" },
	{ name: "palemoon", process: "palemoon" },
	{ name: "maxthon", process: "maxthon" },
	{ name: "cent_browser", process: "centbrowser" },
	{ name: "epic", process: "epic" },
	{ name: "netscape", process: "netscape" },
	{ name: "k-meleon", process: "k-meleon" },
	{ name: "slimjet", process: "slimjet" },
	{ name: "seamonkey", process: "seamonkey" },
	{ name: "coast", process: "coast" },
	{ name: "greenbrowser", process: "greenbrowser" },
	{ name: "midori", process: "midori" },
	{ name: "samsung_internet", process: "samsunginternet" },
	{ name: "palemoon_new", process: "NewMoon" },
	{ name: "basilisk", process: "basilisk" },
	{ name: "iridium", process: "iridium" },
	{ name: "qutebrowser", process: "qutebrowser" },
	{ name: "icy_fox", process: "icyFox" },
	{ name: "ghostbrowser", process: "ghostbrowser" },
	{ name: "blisk", process: "blisk" },
	{ name: "falkon", process: "falkon" },
	{ name: "duckduckgo", process: "duckduckgo" },
	{ name: "qqbrowser", process: "qqbrowser" },
	{ name: "360_browser", process: "360se" },
	{ name: "liebao_browser", process: "liebao" },
	{ name: "ucbrowser", process: "ucbrowser" },
	{ name: "maxthon_new", process: "maxthon5" },
	{ name: "cyberfox", process: "cyberfox" },
	{ name: "tenzor", process: "tenzor" },
	{ name: "amigo", process: "amigo" },
	{ name: "kometa", process: "kometa" },
	{ name: "orbitum", process: "orbitum" },
	{ name: "atom", process: "atom" },
	{ name: "sputnik", process: "sputnik" },
	{ name: "iceweasel", process: "iceweasel" },
	{ name: "iron", process: "iron" },
	{ name: "sleipnir", process: "sleipnir" },
	{ name: "gnome_web", process: "epiphany" },
	{ name: "otter_browser", process: "otter-browser" },
	{ name: "librewolf", process: "librewolf" },
	{ name: "mullvad", process: "mullvadbrowser" },
	{ name: "cliquez", process: "cliquez" },
	{ name: "cometbird", process: "cometbird" },
	{ name: "lunascape", process: "lunascape" },
	{ name: "my_pal", process: "mypal" },
	{ name: "waterfox_classic", process: "waterfoxclassic" },
];
