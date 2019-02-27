module.exports = {
	base: '/lorawan-transport/',
	dest: 'public',
	themeConfig: {
		logo: '/assets/img/logo.png',
		nav: [
			{text: 'Readme', link: '/readme/'},
			{text: 'Application', link: '/app/'},
		],
		sidebar: [
			['/readme/', 'Readme'],
			['/config/', 'Config'],
			['/app/', 'Application'],
			['/server/', 'LoRaWAN Server'],
			['/controller/', 'LoRaWAN Controller'],
			['/handler/', 'LoRaWAN Handler'],
			['/bridge/', 'MQTT Bridge'],
		],
	},
	siteTitle: 'Aloes - LoRaWAN Transport',
	title: 'Aloes - LoRaWAN Transport',
};
