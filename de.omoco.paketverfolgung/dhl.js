function DHL() {
}

DHL.prototype.getAuthor = function() {
	return "Donald Kirker, Sebastian Hammerl";
}

DHL.prototype.getVersion = function() {
	return "2.0";
}

DHL.prototype.getColor = function() {
	return "#f1d871";
}

DHL.prototype.init = function(id, callbackStatus, callbackDetails, callbackError) {
	this.id = id;
	this.callbackStatus = callbackStatus;
	this.callbackDetails = callbackDetails;
	this.callbackError = callbackError;
};

DHL.prototype.getTrackingUrl = function() {
	return "https://mobil.dhl.de/sendung?query=sv_paket&sv-method=query&packet_id=" + this.id;
}

DHL.prototype.getDetails = function() {
	var request = new Ajax.Request(this.getTrackingUrl(), {
		method: 'get',
		evalJS: 'false',
		evalJSON: 'false',
		onSuccess: this.getDetailsRequestSuccess.bind(this),
		onFailure: this.getDetailsRequestFailure.bind(this)
	});
};

DHL.prototype.getDetailsRequestSuccess = function(response) {
	var responseText = response.responseText;
Mojo.Log.info("Response: ", responseText);	
	var status = 0;
	if(responseText.split("img/Icons/Icon_1_ACTIVE.gif").length > 1) {
		status = 1;
	}
	if(responseText.split("img/Icons/Icon_2_ACTIVE.gif").length > 1) {
		status = 2;
	}
	if(responseText.split("img/Icons/Icon_3_ACTIVE.gif").length > 1) {
		status = 3;
	}
	if(responseText.split("img/Icons/Icon_4_ACTIVE.gif").length > 1) {
		status = 4;
	}
	if(responseText.split("img/Icons/Icon_5_ACTIVE.gif").length > 1) {
		status = 5;
	}
	// TODO: Verify this
	if(responseText.split("ungültig").length > 1) {
		status = -1;
	}

	this.callbackStatus(status);

	if(status > 0) {
		var details = [];
		var details2 = 	responseText.split("<div id=\"detailEventsBody\">")[1];
		details2 = details2.split("<div class=\"event\">");
		for (var i=1; i<details2.length; i++) {
			var tmpDate = details2[i].split(" Uhr")[0];
			var tmpNotes = "";
			var tmpLoc = "";
			tmpLoc = details2[i].split("<span>")[2];
			tmpLoc = tmpLoc.split("</span>")[0];
			tmpNotes = details2[i].split("eventText\" style=\"word-wrap: break-word;\">")[1];
			tmpNotes = tmpNotes.split("</span>")[0];
			/*if(details2[i].split(")").length > 1) {
				tmpNotes = details2[i].split("<br>")[1];
				tmpNotes = tmpNotes.split("(")[0];
				tmpLoc = details2[i].split("(")[1];
				tmpLoc = tmpLoc.split(")")[0];
			} else {
				tmpNotes = details2[i].split("<br>")[1];
				tmpNotes = tmpNotes.split("<")[0];
			}*/

			details.push({date: tmpDate, location: tmpLoc, notes: tmpNotes});
		}
		
		details = details.reverse();
		
		this.callbackDetails(details.clone());	
	}
};

DHL.prototype.getDetailsRequestFailure = function(response) {
	this.callbackError("Konnte Seite nicht laden.");
};

registerService("DHL", new DHL());
