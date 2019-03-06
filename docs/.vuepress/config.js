module.exports = {
	title: 'Aloes - LoRaWAN Transport 🚦',
	base: '/lorawan-transport/',
	dest: 'public',
	themeConfig: {
		logo: '/logo.png',
		repo: 'https://framagit.org/aloes/lorawan-transport',
		repoLabel: 'Git',
		docsDir: 'docs',
		nav: [
			{text: 'Readme', link: '/readme/'},
			{text: 'Application', link: '/app/'},
		],
		sidebar: [
			['/readme/', 'Readme'],
			['/config/', 'Config'],
			['/app/', 'Application'],
			['/common/', 'Common'],
			['/server/', 'LoRaWAN Server'],
			['/controller/', 'LoRaWAN Controller'],
			['/handler/', 'LoRaWAN Handler'],
			['/bridge/', 'MQTT Bridge'],
			['/cache/', 'Cache Store'],
			['/file/', 'File Store'],
		],
		serviceWorker: {
			updatePopup: true, // Boolean | Object, default to undefined.
			// If set to true, the default text config will be:
			// updatePopup: {
			//    message: "New content is available.",
			//    buttonText: "Refresh"
			// }
		},
	},
};
