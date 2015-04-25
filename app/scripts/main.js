
(function($) {

	function removeValidateRule(obj) {
		var cssClasses = $(obj).attr('class');
		if(cssClasses) {
			cssClasses = cssClasses.split(' ');
			var result = [];
			for (var i = cssClasses.length - 1; i >= 0; i--) {
				if(cssClasses[i].indexOf('validate') == 0) {
					$(obj).removeClass(cssClasses[i])
				}
			}
		}
	}

    $(document).ready(function() {
        $('.tabs a').on('click', function(e) {
            e.preventDefault();
            var target = $(this).attr('href');
            $(this).closest('.tabs').find('h3').removeClass('active');
            $(this).closest('h3').addClass('active');
            $('.tab-panes').find('.tab-pane').hide();
            $('.tab-panes').find(target).show();
        });
        $('.tabs a').eq(0).trigger('click');
    });

    //矢高，半径，直径计算
    //
    //根据球半径和直径计算矢高
    //h=SR-sqrt（SR^2-(Φ/2)^2）
    var calcRise = function(r, d) {
        return r - Math.sqrt(Math.pow(r, 2) - Math.pow(d / 2, 2));
    }
    
    $('#form-hrd #result-h').on('click', function(e) {
        e.preventDefault();

        removeValidateRule($('#form-hrd #h'));
        removeValidateRule($('#form-hrd #r'));
        removeValidateRule($('#form-hrd #d'));

        $('#form-hrd #r').addClass('validate[required,custom[number]]');
        $('#form-hrd #d').addClass('validate[required,custom[number]]');

        if ($('#form-hrd').validationEngine('validate')) {
            var r = Number($('#form-hrd #r').val()) || 0;
            var d = Number($('#form-hrd #d').val()) || 0;

            if( r <= d) {
            	$('#form-hrd #h').validationEngine('hide');
            	$('#form-hrd #h').val(calcRise(r, d));
            } else {
            	$('#form-hrd #h').validationEngine('showPrompt', ' 参数限定条件：SR≤Φ', 'error', 'centerRight', false);
            }
        } else {
        	$('#form-hrd #h').val('');
        }
    });
    //根据矢高和直径计算球半径
    //SR=（h^2+(Φ/2)^2）/2/h         
    var calcRadius = function(h, d) {
        return (Math.pow(h, 2) + Math.pow((d / 2), 2)) / 2 / h;
    }
    $('#form-hrd #result-r').on('click', function(e) {
        e.preventDefault();

        removeValidateRule($('#form-hrd #h'));
        removeValidateRule($('#form-hrd #r'));
        removeValidateRule($('#form-hrd #d'));

        $('#form-hrd #h').addClass('validate[required,custom[number]]');
        $('#form-hrd #d').addClass('validate[required,custom[number]]');

        if ($('#form-hrd').validationEngine('validate')) {
            var h = Number($('#form-hrd #h').val()) || 0;
            var d = Number($('#form-hrd #d').val()) || 0;

            if( h <= d / 2) {
            	$('#form-hrd #r').validationEngine('hide');
            	$('#form-hrd #r').val(calcRadius(h, d));
            } else {
            	$('#form-hrd #r').validationEngine('showPrompt', ' 参数限定条件：h ≤ Φ/2', 'error', 'centerRight', false);
            }
        } else {
        	$('#form-hrd #r').val('');
        }
    });
    //根据矢高和球半径计算直径
    //Φ=2*sqrt（2*h*SR-h^2)         
    var calcDiameter = function(h, r) {
        return 2 * Math.sqrt(2 * h * r - Math.pow(h, 2));
    }
    $('#form-hrd #result-d').on('click', function(e) {
        e.preventDefault();

        removeValidateRule($('#form-hrd #h'));
        removeValidateRule($('#form-hrd #r'));
        removeValidateRule($('#form-hrd #d'));

        $('#form-hrd #h').addClass('validate[required,custom[number]]');
        $('#form-hrd #r').addClass('validate[required,custom[number]]');

        if ($('#form-hrd').validationEngine('validate')) {
            var h = Number($('#form-hrd #h').val()) || 0;
            var r = Number($('#form-hrd #r').val()) || 0;

            if( h <= r ) {
            	$('#form-hrd #d').validationEngine('hide');
            	$('#form-hrd #d').val(calcDiameter(h, r));
            } else {
            	$('#form-hrd #d').validationEngine('showPrompt', ' 参数限定条件：h ≤ SR', 'error', 'centerRight', false);
            }
        } else {
        	$('#form-hrd #d').val('');
        }

    });



})(jQuery);