function USPS() {
}

USPS.prototype.getAuthor = function() {
	return "Sebastian Hammerl, Donald Kirker";
}

USPS.prototype.getVersion = function() {
	return "1.1";
}

USPS.prototype.getColor = function() {
	return "#7298b2";
}

USPS.prototype.init = function(id, callbackStatus, callbackDetails, callbackError) {
	this.id = id;
	this.callbackStatus = callbackStatus;
	this.callbackDetails = callbackDetails;
	this.callbackError = callbackError;
};

USPS.prototype.getTrackingUrl = function() {
	return "https://tools.usps.com/go/TrackConfirmAction_input?qtc_tLabels1=" + this.id + "&qtc_senddate1=&qtc_zipcode1=";
}

USPS.prototype.getDetails = function() {
	var request = new Ajax.Request(this.getTrackingUrl(), {
		method: 'get',
		evalJS: 'false',
		evalJSON: 'false',
		onSuccess: this.getDetailsRequestSuccess.bind(this),
		onFailure: this.getDetailsRequestFailure.bind(this)
	});
};

USPS.prototype.getDetailsRequestSuccess = function(response) {
	var responseText = response.responseText;
	
	var responseText2 = responseText.split("<div class=\"progress-indicator\">")[1];
	responseText2 = responseText2.split("<h2 class=\"hide-fromsighted\">")[1];

	var status = 0;
	if(responseText2.split("Accept").length > 1 || responseText2.split("Info Received").length > 1 || responseText2.split("Picked Up").length > 1) {
		status = 1;
	}
	if (responseText2.split("GIBTS ES WOHL NICHT").length > 1 || responseText2.split("Arrived Shipping Partner Facility").length > 1) {
		status = 2;
	}
	if (responseText2.split("Process").length > 1 || responseText2.split("Depart").length > 1 || responseText2.split("Sorting").length > 1) {
		status = 3;
	}
	if (responseText2.split("Delivery").length > 1) {
		status = 4;
	}
	if (responseText2.split("Delivered").length > 1) {
		status = 5;
	}
	if (responseText2.split("Sorry, there's no information for that number.").length > 1 || responseText2.split("Delivery status information is not available").length > 1) {
		status = -1;
	}

	this.callbackStatus(status);

	if (status > 0) {
		var details = [];
		
		var detailsText = responseText.split("detail-wrapper");
		for (var i = 1; i < detailsText.length; i++) {
			var detailsSplit = detailsText[i].split("<p");

			// > Want the text here and strip non-date/time characters </p>
			var tmpDateStr = detailsSplit[1].split("</p>")[0].split(">")[1].replace(/[\r]/g, " ").replace(/[^,: a-zA-Z0-9]/g, "").trim();

			// > Want the text here </p>
			var tmpLoc = detailsSplit[3].split("</p>")[0].split(">")[1].replace(/[\t\r]/g, "").trim();

			// info-text"> Want the text here </span>
			var tmpNotes = detailsText[i].split("info-text\">")[1].split("</span>")[0].replace(/[\t\r]/g, "").trim();
			
			details.push({date: tmpDateStr, location: tmpLoc, notes: tmpNotes});
		}
		
		this.callbackDetails(details.clone());	
	}
};

USPS.prototype.getDetailsRequestFailure = function(response) {
	this.callbackError($L("Error loading data from USPS."));
};

registerService("USPS", new USPS());
