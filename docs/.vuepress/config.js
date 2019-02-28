module.exports = {
	base: '/lorawan-transport',
	dest: 'public',
	themeConfig: {
		logo: '/hero.png',
		repo: 'https://framagit.org/aloes/aloes-handlers',
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
	title: 'Aloes - LoRaWAN Transport 🚦',
};
