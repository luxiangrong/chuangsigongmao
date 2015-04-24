(function($){

	var patterns = {
		text: /^['"]?(.+?)["']?$/,
		url: /^url\(["']?(.+?)['"]?\)$/
	};

	function clean(content) {
		if(content && content.length) {
			var text = content.match(patterns.text)[1],
				url = text.match(patterns.url);
			return url ? '<img src="' + url[1] + '" />': text;
		}
	}

	function inject(prop, elem, content) {
		if(prop != 'after') prop = 'before';
		if(content = clean(elem.currentStyle[prop])) {
			$(elem)[prop == 'before' ? 'prepend' : 'append'](
				$(document.createElement('span')).addClass(prop).html(content)
			);
		}
	}

	$.pseudo = function(elem) {
		inject('before', elem);
		inject('after', elem);
		elem.runtimeStyle.behavior = null;
	};
	
	if(document.createStyleSheet) {
		var o = document.createStyleSheet(null, 0);
		o.addRule('.dummy','display: static;');
		o.cssText = 'html, head, head *, body, *.before, *.after, *.before *, *.after * { behavior: none; } * { behavior: expression($.pseudo(this)); }';
	}

	$(document).ready(function(){
		$('.tabs a').on('click', function(e){
			e.preventDefault();
			var target = $(this).attr('href');
			$(this).closest('.tabs').find('h3').removeClass('active');
			$(this).closest('h3').addClass('active');
			$('.tab-panes').find('.tab-pane').hide();
			$('.tab-panes').find(target).show();
		});
		$('.tabs a').eq(0).trigger('click');
	});

})(jQuery);