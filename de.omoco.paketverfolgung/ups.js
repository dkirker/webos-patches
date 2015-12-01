function UPS() {
}

UPS.prototype.getAuthor = function() {
	return "Sebastian Hammerl";
}

UPS.prototype.getVersion = function() {
	return "1.0";
}

UPS.prototype.getColor = function() {
	return "#8b7271";
}

UPS.prototype.init = function(id, callbackStatus, callbackDetails, callbackError) {
	this.id = id;
	this.callbackStatus = callbackStatus;
	this.callbackDetails = callbackDetails;
	this.callbackError = callbackError;
};

UPS.prototype.getTrackingUrl = function() {
	return this.getTrackingUrlMobile();
};

UPS.prototype.getTrackingUrlDesktop = function() {
	if(LANG == "de")
		return "http://wwwapps.ups.com/WebTracking/track?HTMLVersion=5.0&loc=de_DE&trackNums=" + this.id + "&track.y=10&Requester=TRK_MOD&showMultipiece=N&detailNumber=undefined&WBPM_lid=homepage%2Fct1.html_pnl_trk";
	return "http://wwwapps.ups.com/WebTracking/track?HTMLVersion=5.0&loc=en_US&trackNums=" + this.id + "&track.y=10&Requester=TRK_MOD&showMultipiece=N&detailNumber=undefined&WBPM_lid=homepage%2Fct1.html_pnl_trk";
};

UPS.prototype.getTrackingUrlMobile = function() {
	return "https://m.ups.com/mobile/track?t=t&trackingNumber=" + this.id;
};

UPS.prototype.getDetails = function() {
	var request = new Ajax.Request(this.getTrackingUrl(), {
		method: 'get',
		evalJS: 'false',
		evalJSON: 'false',
		onSuccess: this.getDetailsRequestSuccess.bind(this),
		onFailure: this.getDetailsRequestFailure.bind(this)
	});
};

UPS.prototype._escapeChars = { lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' };

UPS.prototype._unescapeHTML = function(str) {//modified from underscore.string and string.js
    return str.replace(/\&([^;]+);/g, function(entity, entityCode) {
        var match;

        if (entityCode in this._escapeChars) {
            return this._escapeChars[entityCode];
        } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
            return String.fromCharCode(parseInt(match[1], 16));
        } else if (match = entityCode.match(/^#(\d+)$/)) {
            return String.fromCharCode(~~match[1]);
        } else {
            return entity;
        }
    }.bind(this));
};

UPS.prototype.getDetailsRequestSuccess = function(response) {
	return this.getDetailsRequestSuccessMobile(response);
};

UPS.prototype.getDetailsRequestSuccessMobile = function(response) {
    var responseText = this._unescapeHTML(response.responseText);
	//var expectedDelivery = responseText.split("Scheduled Delivery Date:")[1].split("<dd>")[1].split("</dd>")[0];

    var statusText = responseText.split("Package Progress")[1];
    var status = 0;
    if(statusText.split("HERKUNFTSSCAN").length > 1 || statusText.split("Herkunfts Scan").length > 1 ||
       statusText.split("Auftrag verarbeitet").length > 1 || statusText.split("Origin Scan").length > 1 ||
       statusText.split("Order Processed").length > 1) {
        status = 1;
    }
    if(statusText.split("ABFAHRTSSCAN").length > 1 || statusText.split("Abfahrts Scan").length > 1 ||
       statusText.split("Departure Scan").length > 1) {
        status = 2;
    }
    if(statusText.split("ANKUNFTSSCAN").length > 1 || statusText.split("Ankunfts Scan").length > 1 ||
       statusText.split("Arrival Scan").length > 1) {
        status = 3;
    }
    if(statusText.split("WIRD ZUGESTELLT").length > 1 || statusText.split("Wird zugestellt").length > 1 ||
       statusText.split("Out For Delivery").length > 1) {
        status = 4;
    }
    if(statusText.split("UPS hat die Sendung zugestellt").length > 1 || statusText.split("UPS has delivered the shipment").length > 1 ||
	   statusText.split("Package picked up at UPS Access Point").length > 1) {
        status = 5;
    }
    if(statusText.split("1Z9999999999999999").length > 1) {
        status = -1;
    }

    this.callbackStatus(status);

    if(status > 0) {
        var details = [];
        var details2 = responseText.split("Package Progress")[1].split("<ul>");
        for (var i = 1; i < details2.length; i++) {
			var scanEntry = details2[i].split("</ul>")[0];
			var scanParts = scanEntry.split("<li>");
			var tmpLoc = "";
			var tmpDate = "";
			var tmpNotes = "";

/*
		<ul>	
        	
            	<li><strong>Omaha&#44;&#32;NE&#44;&#32;US</strong></li>
            
        	<li>11&#x2f;21&#x2f;2015 4&#x3a;17&#32;A&#46;M&#46;</li>
            <li>Departure&#32;Scan</li>
        </ul>

	
		<ul>	
        	
        	<li>11&#x2f;21&#x2f;2015 12&#x3a;38&#32;A&#46;M&#46;</li>
            <li>Arrival&#32;Scan</li>
        </ul>
*/

			if (scanParts.length === 3) { // Location from previous scan
				tmpDate = scanParts[1].split("</li>")[0];
				tmpNotes = scanParts[2].split("</li>")[0];
				if (i > 1) {
					tmpLoc = details[i-2].location;
				}
			} else if (scanParts.length === 4) { // New location
				tmpLoc = scanParts[1].split("<strong>")[1].split("</strong>")[0];
				tmpDate = scanParts[2].split("</li>")[0];
				tmpNotes = scanParts[3].split("</li>")[0];
			}
            details.push({date: tmpDate, location: tmpLoc, notes: tmpNotes});
        }

        this.callbackDetails(details.clone());
    }
};

UPS.prototype.getDetailsRequestSuccessDesktop = function(response) {
	var responseText = response.responseText;

	var statusText = responseText.split("Shipment Progress")[1];
Mojo.Log.error("statusText " + statusText);
	var status = 0;
	if(statusText.split("HERKUNFTSSCAN").length > 1 || statusText.split("Herkunfts Scan").length > 1 ||
	   statusText.split("Auftrag verarbeitet").length > 1 || statusText.split("Origin Scan").length > 1 ||
	   statusText.split("Order Processed").length > 1) {
		status = 1;
	}
	if(statusText.split("ABFAHRTSSCAN").length > 1 || statusText.split("Abfahrts Scan").length > 1 ||
	   statusText.split("Departure Scan").length > 1) {
		status = 2;
	}
	if(statusText.split("ANKUNFTSSCAN").length > 1 || statusText.split("Ankunfts Scan").length > 1 ||
	   statusText.split("Arrival Scan").length > 1) {
		status = 3;
	}
	if(statusText.split("WIRD ZUGESTELLT").length > 1 || statusText.split("Wird zugestellt").length > 1 ||
	   statusText.split("Out For Delivery").length > 1) {
		status = 4;
	}
	if(statusText.split("UPS hat die Sendung zugestellt").length > 1 || statusText.split("UPS has delivered the shipment").length > 1 ||
	   statusText.split("Package picked up at UPS Access Point").length > 1) {
		status = 5;
	}
	if(statusText.split("1Z9999999999999999").length > 1) {
		status = -1;
	}
Mojo.Log.error("status " + status);

	this.callbackStatus(status);

	if(status > 0) {
		var details = [];
		var details2 = responseText.split("<td class=\"nowrap\">");
Mojo.Log.error("details2 " + details2);
		for (var i=1; i<details2.length; i+=3) {
Mojo.Log.error("details2[i] " + details2[i] + " details2[i+1] " + details2[i+1] + " details2[i+2] " + details2[i+2]);
			var tmpLoc = details2[i].split("</td>")[0];
			var tmpDate1 = details2[i+1].split("</td>")[0];
			var tmpDate2 = details2[i+2].split("</td>")[0];
			var tmpDate = tmpDate1 + " " + tmpDate2;
			var tmpNotes = details2[i+2].split("<td>")[1];
			tmpNotes = tmpNotes.split("</td>")[0];
			details.push({date: tmpDate, location: tmpLoc, notes: tmpNotes});
		}
		
		this.callbackDetails(details.clone());	
	}
};

UPS.prototype.getDetailsRequestFailure = function(response) {
	this.callbackError("Konnte Seite nicht laden.");
};

registerService("UPS", new UPS());
