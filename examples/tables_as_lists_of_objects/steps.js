// This is the glue code between the DaSpec automation framework and the production code

/*global defineStep, InventoryService */
var inventoryService = new InventoryService(),
	orderResult;
defineStep(/Assuming the following inventory/, function (table) {
	'use strict';
	table.items.forEach(function (itemRow) {
		inventoryService.add(itemRow[0], parseFloat(itemRow[1]));
	});
});
defineStep(/When a customer order with the following items is processed/, function (table) {
	'use strict';
	var order = {};
	table.items.forEach(function (itemRow) {
		order[itemRow[0]] = itemRow[1];
	});
	orderResult = inventoryService.fulfill(order);
});
defineStep(/The following items will be (.*):/, function (status, tableOfItems) {
	'use strict';
	var itemsToCheck, actualTable;
	if (status == 'shipped') {
		itemsToCheck = orderResult.shipped;
	} else if (status == 'added to the exception queue') {
		itemsToCheck = orderResult.exception;
	}
	actualTable = Object.keys(itemsToCheck).map(function (key) {
		return [key, itemsToCheck[key]];
	});
	this.assertUnorderedTableEquals(tableOfItems, {type:'table', titles: ['Item', 'Quantity'], items: actualTable});
});

