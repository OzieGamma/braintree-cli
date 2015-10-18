var braintree = require("braintree");

function showTransactionSummary(userData, scale) {
	var env = userData.env === "sandbox" ? braintree.Environment.Sandbox : braintree.Environment.Production;
	
	console.log("Showing transactions per " + scale);
	
	var startDate = new Date();
	var endDate = new Date();
	
	if(scale === "hour"){
		startDate.setDate(startDate.getDate() - 1);
		endDate.setDate(startDate.getDate() + 1);
	} else if(scale === "day") {
		startDate.setMonth(startDate.getMonth() - 1);
		endDate.setMonth(startDate.getMonth() + 1);
	} else { // Month
		startDate.setFullYear(startDate.getFullYear() - 1);
		endDate.setFullYear(startDate.getFullYear() + 1);
	}

		
	for(var i = 0; i < userData.merchants.length; i += 1) {
		var gateway = braintree.connect({
			environment: braintree.Environment.Sandbox,
			merchantId: userData.merchants[i],
			publicKey: userData.publicKey,
			privateKey: userData.privateKey
		});
		
		var sums = {};
		
		// Show summary
		var stream = gateway.transaction.search(function (search) {
			search.createdAt().min(startDate);
			search.createdAt().max(endDate);
		});
		
		
		stream.on("data", function (transaction) {
			var date = "";
			if(scale === "hour"){
				date = transaction.createdAt.substring(0, 13);
			} else if(scale === "day") {
				date = transaction.createdAt.substring(0, 10);
			} else { // Month
				date = transaction.createdAt.substring(0, 7);
			}

			sums[transaction.merchantAccountId] = sums[transaction.merchantAccountId] || {currency: transaction.currencyIsoCode};
			if(sums[transaction.merchantAccountId][date] === undefined) {
				sums[transaction.merchantAccountId][date] = parseFloat(transaction.amount);
			} else {
				sums[transaction.merchantAccountId][date] += parseFloat(transaction.amount);
			}	
		});

		stream.on("end", function () {
			
			for(var merchantAccountId in sums){
				console.log("\nMerchant: " + merchantAccountId);
				console.log("Currency: " + sums[merchantAccountId].currency + "\n");
				
				var width = 80;
				
				// Autoscale graph
				var max = 0.0;
				for (var date in sums[merchantAccountId]) {
					if (sums[merchantAccountId].hasOwnProperty(date)) {
						if(sums[merchantAccountId][date] > max){
							max = sums[merchantAccountId][date];
						}
					}
				}
			
				for(var i = 20; i >= 0; i -= 1) {
					var line = "";
					
					if(i % 5 === 0) {
						var str = "" + (i/5) * max / 4;
						var pad = "         ";
						line += pad.substring(0, pad.length - str.length) + str + "|";
					} else {
						line += "         |";
					}
				
					if(scale === "hour"){
						for(var h = 0; h < 24; h += 1){
							
							var date = new Date(endDate);
							date.setHours(date.getHours() - 23 + h);
							var dateStr = date.toISOString().substring(0, 13);
							
							if(sums[merchantAccountId][dateStr] === undefined){
								sums[merchantAccountId][dateStr] = 0;
								line += "...";
							} else if(sums[merchantAccountId][dateStr] > (i * max /20) || sums[merchantAccountId][dateStr] === max){
								line += "XXX";
							} else {
								line += "...";
							}
						}
					} else if(scale === "day") {
						for(var d = 0; d < 31; d += 1){
							var date = new Date(endDate);
							date.setDate(date.getDate() - 30 + d);
							var dateStr = date.toISOString().substring(0, 10);
							
							if(sums[merchantAccountId][dateStr] === undefined){
								sums[merchantAccountId][dateStr] = 0;
								line += "..";
							} else if(sums[merchantAccountId][dateStr] > (i * max /20) || sums[merchantAccountId][dateStr] === max){
								line += "XX";
							} else {
								line += "..";
							}
						}
					} else {
						for(var m = 0; m < 12; m += 1){	
							var date = new Date(endDate);
							date.setMonth(date.getMonth() - 11 + m);
							var dateStr = date.toISOString().substring(0, 7);
							
							if(sums[merchantAccountId][dateStr] === undefined){
								sums[merchantAccountId][dateStr] = 0;
								line += ".....";
							} else if(sums[merchantAccountId][dateStr] > (i * max /20) || sums[merchantAccountId][dateStr] === max){
								line += "XXXXX";
							} else {
								line += ".....";
							}
						}
					}	

					console.log(line);		
				}
				
				// Now print bottom line
				var line = "          ";
				var num = 0;
				if(scale === "hour"){
					num = 24 * 3;
				} else if(scale === "day") {
					num = 31 * 2;
				} else {
					num = 12 * 5;
				}	
				for(var i = 0; i < num; i += 1){ 
					line += "¯";		
				}
				
				console.log(line);
				
				// Now print the labels
				if(scale === "hour"){
					line = "     hour ";
					for(var h = 0; h < 24; h += 1){
						var date = new Date(endDate);
						date.setHours(date.getHours() - 23 + h);
						line += date.toISOString().substring(11, 13) + " ";
					}
				} else if(scale === "day") {
					line = "      day ";
					for(var d = 0; d < 31; d += 1){
						if(d % 2 == 0) {
							var date = new Date(endDate);
							date.setDate(date.getDate() - 30 + d);
							line += date.toISOString().substring(8, 10);
						} else {
							line += "  ";
						}
					}
				} else {
					line = "    month ";
					for(var m = 0; m < 12; m += 1){
						var date = new Date(endDate);
						date.setMonth(date.getMonth() - 11 + m);
						line += " " + date.toISOString().substring(5, 7) + "  ";
					}
				}	
				
				console.log(line);
				
			}
			
		});
	}
}

module.exports = {
	showTransactionSummary: showTransactionSummary
}