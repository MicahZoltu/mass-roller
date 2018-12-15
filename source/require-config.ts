declare var require: any;
require.config({
	paths: {
		"knockout": "https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.2/knockout-min",
		"knockout-dragdrop": "https://cdnjs.cloudflare.com/ajax/libs/knockout-dragdrop/2.6.1/knockout.dragdrop",
	}
})

require(['./main'])
