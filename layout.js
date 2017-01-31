// App Root Object
var AMM =
{
	constants: {
		FIELD_WIDTH: 60,
		FIELD_HEIGHT: 60,
		MARKER_WIDTH: 30,
		GAMEBOARD_MARGINTOP: 100,
		SCROLL_BOTTOM_OFFSET: 120
	},
	options: {
		rowCount : 15,
		fieldCount : 4,
		colors :
		[
			'red',
			'blue',
			'green',
			'yellow',
			'orange',
			'brown',
			'black',
			'white'
		]
	},
	rows : [],
	activeRow: 0,
	colortrayRowCount: 1,
	getActiveRow: function()
	{
		if(this.activeRow > -1)
			return this.rows[this.activeRow];
	}
};
var refreshColortrayOffset = function()
{
	var calculatedOffset = AMM.constants.FIELD_HEIGHT * (AMM.rows.length - AMM.colortrayRowCount-AMM.activeRow);
	
	$(AMM.colortray).css("margin-top", Math.max(calculatedOffset, 0)+AMM.constants.GAMEBOARD_MARGINTOP);
}
var refreshColortrayWidth = function()
{
	var requiredColumns = Math.ceil(AMM.options.colors.length*AMM.constants.FIELD_HEIGHT/window.innerHeight);
	$(AMM.colortray).css("width", requiredColumns*AMM.constants.FIELD_WIDTH);
	AMM.colortrayRowCount = Math.ceil(AMM.options.colors.length/requiredColumns);
}

var drawColortray = function()
{
	AMM.colortray = AMM.colortray || $('<div id="colortray"></div>');
	
	AMM.colortray.empty();
	for (var i = AMM.options.colors.length - 1; i >= 0; i--) {
		$('<div class="field"></div>')
			.css("background-color", AMM.options.colors[i])
			.appendTo(AMM.colortray)
			.draggable({
				stop: function(event, ui)
				{
					ui.helper.css({
						'left': '',
						'top': ''
					});
				}
			});
	};
	
	refreshColortrayWidth();
	refreshColortrayOffset();
	
	if($('#colortray').length == 0)
		$('body').after(AMM.colortray);
}

var initializeRows = function()
{
	$(AMM.gameboard).empty();
	
	for (var i = AMM.options.rowCount - 1; i >= 0; i--)
	{
		AMM.rows[i] = $('<div class="row"><div class="hidden-indicator">' + (i+1) + '</div></div>').appendTo(AMM.gameboard)[0];
		
		for(var k = AMM.options.fieldCount - 1; k >= 0; k--)
		{
			$('<div class="field"></div>').appendTo(AMM.rows[i]);
		}
		for(var k = AMM.options.fieldCount - 1; k >= 0; k--)
		{
			$('<div class="marker"></div>').appendTo(AMM.rows[i]);
		}
	};
}
var drawGameboard = function()
{
	AMM.gameboard = AMM.gameboard || $('<div id="gameboard"></div>');
	AMM.gameboard.css("width", AMM.options.fieldCount * AMM.constants.FIELD_WIDTH + Math.ceil(AMM.options.fieldCount/2)*AMM.constants.MARKER_WIDTH + 140)
		.appendTo($('body'));
	
	initializeRows();
	
	AMM.gameboard.append('<div class="clearfix"></div>');
}

var scrollActiveRowToBottom = function()
{
	window.scrollTo(0,AMM.constants.GAMEBOARD_MARGINTOP + (AMM.rows.length-AMM.activeRow)*AMM.constants.FIELD_HEIGHT+AMM.constants.SCROLL_BOTTOM_OFFSET-window.innerHeight);
}

var refreshIndicator = function()
{
	$('.active-indicator').removeClass('active-indicator').addClass('hidden-indicator');
	$(AMM.getActiveRow()).children(":first").removeClass('hidden-indicator').addClass('active-indicator');
}
var setActiveRow = function(id)
{
	if(id === "next")
		id = AMM.activeRow + 1;
	
	if(typeof id == 'number' && id < AMM.rows.length)
	{
		$(AMM.getActiveRow()).find(".field").droppable("destroy");
		
		AMM.activeRow = id;
		
		$(AMM.getActiveRow()).find(".field").droppable({
			over: function(event, ui)
			{
				$(this).css('background-color', ui.draggable.css("background-color"));
			},
			out: function(event, ui)
			{
				if($(this).attr("data-chosencolor"))
					$(this).css('background-color', $(this).attr("data-chosencolor"));
				else
					$(this).css('background-color', '');
			},
			drop: function(event, ui)
			{
				$(this).attr("data-chosencolor", ui.draggable.css("background-color"));
				$(this).css('background-color', ui.draggable.css("background-color"));
			}
		});
	}
}
var checkRow = function()
{
	setActiveRow("next");
	refreshIndicator();
	refreshColortrayOffset();
	scrollActiveRowToBottom();
}

$(document).ready(function()
{
	drawGameboard();
	
	drawColortray();
	
	$(AMM.getActiveRow()).find(".field").droppable({
		hoverClass: "field-draggable-over"
	});
	setActiveRow(0);
	refreshIndicator();
	refreshColortrayOffset();
	scrollActiveRowToBottom();
});