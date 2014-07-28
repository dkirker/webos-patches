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
	
	//var responseText2 = responseText.split("<tbody class=\"details\">")[1];
	var statusText = responseText.split("<div class=\"progress-indicator\">")[1].split("<h2 class=\"hide-fromsighted\">")[1].split("</h2>")[0];

	// Real USPS statuses:
	//<div class="progress-indicator">
	//	<h2 class="hide-fromsighted">in-transit</h2>
	//</div>
	//
	// Values and Package Tracker values:
	// pre-shipment: 1
	// accepted: 2
	// in-transit: 3
	// in-transit + special: 4
	// delivered: 5
	// error: 0
	// seized: 0
	// archived: 0


	var status = 0;
	if (statusText.indexOf("pre-shipment") != -1) {
		status = 1;
	} else if (statusText.indexOf("accepted") != -1) {
		status = 2;
	} else if (statusText.indexOf("in-transit") != -1) {
		status = 3;
	} /*else if (statusText.indexOf("out-for-delivery") != -1) {
		status = 4;
	}*/ else if (statusText.indexOf("delivered") != -1) {
		status = 5;
	} else {
		status = 0;
		this.callbackStatus(status);
	}

	if (status > 0) {
		var details = [];
		
		var detailsText = responseText.split("detail-wrapper");
		for (var i = 1; i < detailsText.length; i++) {
			var detailsSplit = detailsText[i].split("<td class=\"date-time\">");

			var tmpDateStr = detailsSplit[1].split("<p>")[1].split("</p>")[0].replace(/[\r]/g, " ").replace(/[^,: a-zA-Z0-9]/g, "").trim();

			var tmpLoc = "";
			var tmpNotes = "";
			if (i == 1) {
				tmpLoc = detailsSplit[1].split("<td class=\"location\">")[1].split("<p>")[1].split("</td>")[0].replace(/[\r]/g, " ").replace(/&nbsp;/g, " ").trim();
				tmpNotes = detailsSplit[1].split("<td class=\"status\">")[1].split("<p")[1].split("</p>")[0].split(">")[1].replace(/[\r]/g, " ").replace(/&nbsp;/g, " ").trim();
			
				if (tmpNotes.indexOf("Out for Delivery") != -1) {
					status = 4;
				} else if (tmpNotes.indexOf("Delivery status not updated") != -1) {
					status = 0;
				}			
			} else {
                tmpLoc = detailsSplit[1].split("<td class=\"location\">")[1].split("<p>")[1].split("</p>")[0].replace(/[\r]/g, " ").replace(/&nbsp;/g, " ").trim();
                tmpNotes = detailsSplit[1].split("<td class=\"status\">")[1].split("<span")[1].split("</span>")[0].split(">")[1].replace(/[\r]/g, " ").replace(/&nbsp;/g, " ").trim();
			}

			details.push({date: tmpDateStr, location: tmpLoc, notes: tmpNotes});
		}
		
		this.callbackStatus(status);
		this.callbackDetails(details.clone());	
	}
};

USPS.prototype.getDetailsRequestFailure = function(response) {
	this.callbackError($L("Error loading data from USPS."));
};

registerService("USPS", new USPS());
