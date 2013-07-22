function FedEx() {
}

FedEx.prototype.getAuthor = function() {
	return "Donald Kirker";
}

FedEx.prototype.getVersion = function() {
	return "1.1";
}

FedEx.prototype.getColor = function() {
	return "#a472bd";
}

FedEx.prototype.init = function(id, callbackStatus, callbackDetails, callbackError) {
	this.id = id;
	this.callbackStatus = callbackStatus;
	this.callbackDetails = callbackDetails;
	this.callbackError = callbackError;
};

FedEx.prototype.getTrackingUrl = function() {
	if(LANG == "de")
		return "http://www.fedex.com/Tracking?action=track&language=german&cntry_code=de&mps=y&ascend_header=1&stop_mobi=yes&tracknumbers=" + this.id;
	return "http://www.fedex.com/Tracking?action=track&language=english&cntry_code=en&mps=y&ascend_header=1&stop_mobi=yes&tracknumbers=" + this.id;
}

FedEx.prototype.getDetails = function() {
	var locale = "en_US";
	var data = {
		"TrackPackagesRequest": {
			"appType": "wtrk",
			"uniqueKey": "",
			"processingParameters": {
				"anonymousTransaction": true,
				"clientId": "WTRK",
				"returnDetailedErrors": true,
				"returnLocalizedDateTime": true
			},
			"trackingInfoList": [{
				"trackNumberInfo": {
					"trackingNumber": this.id,
					"trackingQualifier": "",
					"trackingCarrier": ""
				}
			}]
		}
	};

	/*
	if (LANG == "de")
		locale = "de_DE";
	*/

	var dataStringified = Object.toJSON(data);
	Mojo.Log.info("Data: ", dataStringified);

	var request = new Ajax.Request("https://www.fedex.com/trackingCal/track", {
		method: 'post',
		parameters: {"data": dataStringified, "action": "trackpackages", "locale": locale, "format": "json", "version": "99"},
		evalJS: 'false',
		evalJSON: 'true',
		onSuccess: this.getDetailsRequestSuccess.bind(this),
		onFailure: this.getDetailsRequestFailure.bind(this)
	});
};

FedEx.prototype.getDetailsRequestSuccess = function(response) {
	var json = response.responseJSON;
	if (!json && response.responseText) {
		json = Mojo.parseJSON(response.responseText);
	}
	if (!json || !json.TrackPackagesResponse ||
		!json.TrackPackagesResponse.packageList || !json.TrackPackagesResponse.packageList[0]) {
			this.callbackStatus(-1);
			return;
	}
	var errorCode = json.TrackPackagesResponse.packageList[0].errorList[0].code;
	var keyStatus = json.TrackPackagesResponse.packageList[0].keyStatus;
	var status = 0;

	Mojo.Log.info("errorCode: ", errorCode, "keyStatus: ", keyStatus);

	// TODO: I am only certain on "errorCode" and "keyStatus" == "In transit"
	if (errorCode != 0) {
		status = -1;
	} else if (keyStatus.indexOf("Initiated") != -1) {
		status = 1;
	} else if (keyStatus.indexOf("Picked") != -1) {
		status = 2;
	} else if (keyStatus.indexOf("On schedule") != -1) {
		status = 3;
	} else if (keyStatus.indexOf("In transit") != -1 || keyStatus.indexOf("Exception") != -1) {
		status = 4;
	} else if (keyStatus.indexOf("Delivered") != -1) {
		status = 5;
	}

	this.callbackStatus(status);
	
	if (status > 0) {
		var detailsVar = json.TrackPackagesResponse.packageList[0].scanEventList;
		var details = [];
		for (var i = 0; i < detailsVar.length; i++) {
			var tmpDate = detailsVar[i].date + " " + detailsVar[i].time + " " + detailsVar[i].gmtOffset;
			Mojo.Log.info("date: ", tmpDate, " location: ", detailsVar[i].scanLocation, " notes: ", detailsVar[i].status);
			details.push({date: tmpDate, location: detailsVar[i].scanLocation, notes: detailsVar[i].status});
		}
		
		this.callbackDetails(details.clone());	
	}
};

FedEx.prototype.getDetailsRequestFailure = function(response) {
	Mojo.Log.info("Status: ", response.statusText, " Response: ", response.responseText, " Headers: ", Object.toJSON(response.headerJSON), "Response JSON: ", Object.toJSON(response.responseJSON));

	this.callbackError("Konnte Seite nicht laden.");
};

registerService("FedEx", new FedEx());
