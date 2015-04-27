(function($) {

    $.validationEngine.defaults.promptPosition = 'centerRight';
    $.validationEngine.defaults.scroll = false;

    function removeValidateRule(obj) {
        var cssClasses = $(obj).attr('class');
        if (cssClasses) {
            cssClasses = cssClasses.split(' ');
            var result = [];
            for (var i = cssClasses.length - 1; i >= 0; i--) {
                if (cssClasses[i].indexOf('validate') == 0) {
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

    var validationEngineOptions = {
        scroll: false,
        promptPosition: 'centerRight'
    };


    /**************************
     * 矢高，半径，直径计算
     *************************/

    //根据球半径和直径计算矢高
    //h=SR-sqrt（SR^2-(Φ/2)^2）
    var calcRise = function(r, d) {
        return r - Math.sqrt(Math.pow(r, 2) - Math.pow(d / 2, 2));
    };
    $('#form-hrd #result-h').on('click', function(e) {
        e.preventDefault();

        removeValidateRule($('#form-hrd #h'));
        removeValidateRule($('#form-hrd #r'));
        removeValidateRule($('#form-hrd #d'));
        $('#form-hrd').validationEngine('hideAll');

        $('#form-hrd #r').addClass('validate[required,custom[number]]');
        $('#form-hrd #d').addClass('validate[required,custom[number]]');

        if (!$('#form-hrd #r').validationEngine('validate') && !$('#form-hrd #d').validationEngine('validate')) {
            var r = Number($('#form-hrd #r').val()) || 0;
            var d = Number($('#form-hrd #d').val()) || 0;

            if (r <= d) {
                $('#form-hrd #h').validationEngine('hide');
                $('#form-hrd #h').val(calcRise(r, d));
            } else {
                $('#form-hrd #h').validationEngine('showPrompt', ' 参数限定条件：SR ≤ Φ', 'error', 'centerRight', false);
            }
        } else {
            $('#form-hrd #h').val('');
        }
    });
    //根据矢高和直径计算球半径
    //SR=（h^2+(Φ/2)^2）/2/h         
    var calcRadius = function(h, d) {
        return (Math.pow(h, 2) + Math.pow((d / 2), 2)) / 2 / h;
    };
    $('#form-hrd #result-r').on('click', function(e) {
        e.preventDefault();

        removeValidateRule($('#form-hrd #h'));
        removeValidateRule($('#form-hrd #r'));
        removeValidateRule($('#form-hrd #d'));
        $('#form-hrd').validationEngine('hideAll');

        $('#form-hrd #h').addClass('validate[required,custom[number]]');
        $('#form-hrd #d').addClass('validate[required,custom[number]]');

        if (!$('#form-hrd #h').validationEngine('validate') && !$('#form-hrd #d').validationEngine('validate')) {
            var h = Number($('#form-hrd #h').val()) || 0;
            var d = Number($('#form-hrd #d').val()) || 0;

            if (h <= d / 2) {
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
    };
    $('#form-hrd #result-d').on('click', function(e) {
        e.preventDefault();

        removeValidateRule($('#form-hrd #h'));
        removeValidateRule($('#form-hrd #r'));
        removeValidateRule($('#form-hrd #d'));
        $('#form-hrd').validationEngine('hideAll');

        $('#form-hrd #h').addClass('validate[required,custom[number]]');
        $('#form-hrd #r').addClass('validate[required,custom[number]]');

        if (!$('#form-hrd #h').validationEngine('validate') && !$('#form-hrd #r').validationEngine('validate')) {
            var h = Number($('#form-hrd #h').val()) || 0;
            var r = Number($('#form-hrd #r').val()) || 0;

            if (h <= r) {
                $('#form-hrd #d').validationEngine('hide');
                $('#form-hrd #d').val(calcDiameter(h, r));
            } else {
                $('#form-hrd #d').validationEngine('showPrompt', ' 参数限定条件：h ≤ SR', 'error', 'centerRight', false);
            }
        } else {
            $('#form-hrd #d').val('');
        }

    });

    /**************************
     * 光圈计算
     *************************/
    // 计算凹光圈
    // （2/λ）*[sqrt(1-(Φ/2*SR1)^2)-1]*(SR1-SR2)
    var calcRecessedAperture = function(l, d, sr1, sr2) {
        return (2 / l) * (Math.sqrt(1 - (Math.pow(d / 2 * sr1, 2))) - 1) * (sr1 - sr2);
    };
    // 计算凸光圈
    // （2/λ）*[1-sqrt(1-(Φ/2*SR1)^2)]*(SR1-SR2)
    var calcConvexAperture = function(l, d, sr1, sr2) {
        return (2 / l) * (1 - Math.sqrt(1 - Math.pow(d / 2 * sr1, 2))) * (sr1 - sr2);
    };
    // 计算ΔSR
    // (4*λ*SR1*SR1*N）/（Φ*Φ）
    var calcDeviationSR = function(l, sr1, n, d) {
        return (4 * l * sr1 * sr1 * n) / (d * d);
    };
    // 计算N2
    // （N1*Φ2*Φ2）/（Φ1*Φ1）
    var calcN2 = function(n1, d1, d2) {
        return (n1 * d2 * d2) / (d1 * d1);
    };

    //凹光圈1
    $('#form-aperture #result-n1').on('click', function(e) {
        e.preventDefault();

        //移除之前的验证规则
        $('#form-aperture input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-aperture').validationEngine('hideAll');

        $('#form-aperture #l').addClass('validate[required,custom[number]]');
        $('#form-aperture #d1').addClass('validate[required,custom[number]]');
        $('#form-aperture #SR1').addClass('validate[required,custom[number]]');
        $('#form-aperture #SR2').addClass('validate[required,custom[number]]');

        if (!$('#form-aperture #l').validationEngine('validate') &&
            !$('#form-aperture #d1').validationEngine('validate') &&
            !$('#form-aperture #SR1').validationEngine('validate') &&
            !$('#form-aperture #SR2').validationEngine('validate')
        ) {
            var l = Number($('#form-aperture #l').val());
            var d = Number($('#form-aperture #d1').val());
            var sr1 = Number($('#form-aperture #SR1').val());
            var sr2 = Number($('#form-aperture #SR2').val());


            if (sr1 > 0 && sr2 > 0) {
                $('#form-aperture #SR1, #form-aperture #SR2').validationEngine('hide');
                $('#form-aperture #resultN1').val(calcRecessedAperture(l, d, sr1, sr2));
            } else {
                if (sr1 <= 0) {
                    $('#form-aperture #SR1').validationEngine('showPrompt', ' 参数限定条件：SR > 0', 'error', 'topRight', true);
                }
                if (sr2 <= 0) {
                    $('#form-aperture #SR2').validationEngine('showPrompt', ' 参数限定条件：SR > 0', 'error', 'topRight', true);
                }
            }
        }
    });

    //凸光圈1
    $('#form-aperture #result-n2').on('click', function(e) {
        e.preventDefault();

        //移除之前的验证规则
        $('#form-aperture input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-aperture').validationEngine('hideAll');

        $('#form-aperture #l').addClass('validate[required,custom[number]]');
        $('#form-aperture #d1').addClass('validate[required,custom[number]]');
        $('#form-aperture #SR1').addClass('validate[required,custom[number]]');
        $('#form-aperture #SR2').addClass('validate[required,custom[number]]');

        if (!$('#form-aperture #l').validationEngine('validate') &&
            !$('#form-aperture #d1').validationEngine('validate') &&
            !$('#form-aperture #SR1').validationEngine('validate') &&
            !$('#form-aperture #SR2').validationEngine('validate')
        ) {
            var l = Number($('#form-aperture #l').val());
            var d = Number($('#form-aperture #d1').val());
            var sr1 = Number($('#form-aperture #SR1').val());
            var sr2 = Number($('#form-aperture #SR2').val());

            if (sr1 > 0 && sr2 > 0) {
                $('#form-aperture #SR1, #form-aperture #SR2').validationEngine('hide');
                $('#form-aperture #resultN2').val(calcConvexAperture(l, d, sr1, sr2));
            } else {
                if (sr1 <= 0) {
                    $('#form-aperture #SR1').validationEngine('showPrompt', ' 参数限定条件：SR > 0', 'error', 'topRight', true);
                }
                if (sr2 <= 0) {
                    $('#form-aperture #SR2').validationEngine('showPrompt', ' 参数限定条件：SR > 0', 'error', 'topRight', true);
                }
            }
        }
    });

    //凹光圈2
    $('#form-aperture #result-n3').on('click', function(e) {
        e.preventDefault();

        //移除之前的验证规则
        $('#form-aperture input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-aperture').validationEngine('hideAll');

        $('#form-aperture #l').addClass('validate[required,custom[number]]');
        $('#form-aperture #d1').addClass('validate[required,custom[number]]');
        $('#form-aperture #dSR').addClass('validate[required,custom[number]]');
        $('#form-aperture #SR3').addClass('validate[required,custom[number]]');

        if (!$('#form-aperture #l').validationEngine('validate') &&
            !$('#form-aperture #d1').validationEngine('validate') &&
            !$('#form-aperture #dSR').validationEngine('validate') &&
            !$('#form-aperture #SR3').validationEngine('validate')
        ) {
            var l = Number($('#form-aperture #l').val());
            var d = Number($('#form-aperture #d1').val());
            var sr1 = Number($('#form-aperture #dSR').val());
            var sr2 = Number($('#form-aperture #SR3').val());

            if (sr1 > 0 && sr2 > 0) {
                $('#form-aperture #dSR, #form-aperture #SR3').validationEngine('hide');
                $('#form-aperture #resultN3').val(calcRecessedAperture(l, d, sr1, sr2));
            } else {
                if (sr1 <= 0) {
                    $('#form-aperture #dSR').validationEngine('showPrompt', ' 参数限定条件：SR > 0', 'error', 'topRight', true);
                }
                if (sr2 <= 0) {
                    $('#form-aperture #SR3').validationEngine('showPrompt', ' 参数限定条件：SR > 0', 'error', 'topRight', true);
                }
            }
        }
    });

    //凸光圈2
    $('#form-aperture #result-n4').on('click', function(e) {
        e.preventDefault();

        //移除之前的验证规则
        $('#form-aperture input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-aperture').validationEngine('hideAll');

        $('#form-aperture #l').addClass('validate[required,custom[number]]');
        $('#form-aperture #d1').addClass('validate[required,custom[number]]');
        $('#form-aperture #dSR').addClass('validate[required,custom[number]]');
        $('#form-aperture #SR3').addClass('validate[required,custom[number]]');

        if (!$('#form-aperture #l').validationEngine('validate') &&
            !$('#form-aperture #d1').validationEngine('validate') &&
            !$('#form-aperture #dSR').validationEngine('validate') &&
            !$('#form-aperture #SR3').validationEngine('validate')
        ) {
            var l = Number($('#form-aperture #l').val());
            var d = Number($('#form-aperture #d1').val());
            var sr1 = Number($('#form-aperture #dSR').val());
            var sr2 = Number($('#form-aperture #SR3').val());

            if (sr1 > 0 && sr2 > 0) {
                $('#form-aperture #dSR, #form-aperture #SR3').validationEngine('hide');
                $('#form-aperture #resultN4').val(calcConvexAperture(l, d, sr1, sr2));
            } else {
                if (sr1 <= 0) {
                    $('#form-aperture #dSR').validationEngine('showPrompt', ' 参数限定条件：SR > 0', 'error', 'topRight', true);
                }
                if (sr2 <= 0) {
                    $('#form-aperture #SR3').validationEngine('showPrompt', ' 参数限定条件：SR > 0', 'error', 'topRight', true);
                }
            }
        }
    });

    //△SR
    $('#form-aperture #result-dsr').on('click', function(e) {
        e.preventDefault();

        //移除之前的验证规则
        $('#form-aperture input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-aperture').validationEngine('hideAll');

        $('#form-aperture #l').addClass('validate[required,custom[number]]');
        $('#form-aperture #d1').addClass('validate[required,custom[number]]');
        $('#form-aperture #n1').addClass('validate[required,custom[number]]');
        $('#form-aperture #SR4').addClass('validate[required,custom[number]]');

        if (!$('#form-aperture #l').validationEngine('validate') &&
            !$('#form-aperture #d1').validationEngine('validate') &&
            !$('#form-aperture #n1').validationEngine('validate') &&
            !$('#form-aperture #SR4').validationEngine('validate')
        ) {
            var l = Number($('#form-aperture #l').val());
            var d = Number($('#form-aperture #d1').val());
            var n = Number($('#form-aperture #n1').val());
            var sr = Number($('#form-aperture #SR4').val());

            if (sr > 0) {
                $('#form-aperture #SR4').validationEngine('hide');
                $('#form-aperture #resultDSR').val(calcDeviationSR(l, sr, n, d));
            } else {
                $('#form-aperture #SR4').validationEngine('showPrompt', ' 参数限定条件：SR > 0', 'error', 'topRight', true);
            }
        }
    });

    //N2
    $('#form-aperture #result-n5').on('click', function(e) {
        e.preventDefault();

        //移除之前的验证规则
        $('#form-aperture input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-aperture').validationEngine('hideAll');

        $('#form-aperture #n2').addClass('validate[required,custom[number]]');
        $('#form-aperture #d2').addClass('validate[required,custom[number]]');
        $('#form-aperture #d3').addClass('validate[required,custom[number]]');

        if (!$('#form-aperture #n2').validationEngine('validate') &&
            !$('#form-aperture #d2').validationEngine('validate') &&
            !$('#form-aperture #d3').validationEngine('validate')
        ) {
            var n = Number($('#form-aperture #n2').val());
            var d1 = Number($('#form-aperture #d2').val());
            var d2 = Number($('#form-aperture #d3').val());

            $('#form-aperture #resultN5').val(calcN2(n, d1, d2));
        }
    });


    /**************************
     * 焦距计算
     *************************/

    var FocalLength = {
        //计算像方焦距
        //f`=(n*SR1*SR2)/[(n-1)*(n(SR2-SR1)+(n-1)*d)]
        f1: function(d, n, sr1, sr2) {
            return (n * sr1 * sr2) / ((n - 1) * (n * (sr2 - sr1) + (n - 1) * d));
        },
        //计算lf`（透镜表面顶点到像方焦点距离）
        //lf`=(n*SR1*SR2)/[(n-1)*(n(SR2-SR1)+(n-1)*d))-d*SR2/(n*(SR2-SR1)+(n-1)*d]
        d: function(d, n, sr1, sr2) {
            return (n * sr1 * sr2) / ((n - 1) * (n * (sr2 - sr1) + (n - 1) * d)) - d * sr2 / (n * (sr2 - sr1) + (n - 1) * d);
        },
        //计算胶合像方焦距
        //f`=f1`*f2`/(f1`+f2`-d)                 其中f1`和f2`的算法参见像方焦距计算
        f2: function(d, f1, f2) {
            return f1 * f2 / (f1 + f2 - d);
        },
        //bfl（胶合透镜后截距 l’f）
        //bfl =f’(1-d/f1’)，  f1’是第一片透镜的焦距；
        d2: function(f, d, f1){
            return f * (1 - d / f1);
        }
    };
    //像方焦距
    $('#form-FocalLength #result-f-1').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-FocalLength input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-FocalLength').validationEngine('hideAll');

        $('#form-FocalLength #d').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #n').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr1-1').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr2-1').addClass('validate[required,custom[number]]');

        if (!$('#form-FocalLength #d').validationEngine('validate') &&
            !$('#form-FocalLength #n').validationEngine('validate') &&
            !$('#form-FocalLength #sr1-1').validationEngine('validate') &&
            !$('#form-FocalLength #sr2-1').validationEngine('validate')
        ) {
            var d = Number($('#form-FocalLength #d').val());
            var n = Number($('#form-FocalLength #n').val());
            var sr1 = Number($('#form-FocalLength #sr1-1').val());
            var sr2 = Number($('#form-FocalLength #sr2-1').val());

            $('#form-aperture #resultN5').val(calcN2(n, d1, d2));

            if (n > 1 && d > 0) {
                $('#form-FocalLength #d, #form-FocalLength #n').validationEngine('hide');
                $('#form-FocalLength #resultF1').val(FocalLength.f1(d, n, sr1, sr2));
            } else {
                if (n <= 1) {
                    $('#form-FocalLength #n').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
                if (d <= 0) {
                    $('#form-FocalLength #d').validationEngine('showPrompt', ' 参数限定条件：d > 0', 'error', 'topRight', true);
                }
            }
        }

    });

    //透镜表面顶点到像方焦点的距离
    $('#form-FocalLength #result-d-1').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-FocalLength input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-FocalLength').validationEngine('hideAll');

        $('#form-FocalLength #d').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #n').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr1-1').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr2-1').addClass('validate[required,custom[number]]');

        if (!$('#form-FocalLength #d').validationEngine('validate') &&
            !$('#form-FocalLength #n').validationEngine('validate') &&
            !$('#form-FocalLength #sr1-1').validationEngine('validate') &&
            !$('#form-FocalLength #sr2-1').validationEngine('validate')
        ) {
            var d = Number($('#form-FocalLength #d').val());
            var n = Number($('#form-FocalLength #n').val());
            var sr1 = Number($('#form-FocalLength #sr1-1').val());
            var sr2 = Number($('#form-FocalLength #sr2-1').val());

            if (n > 1 && d > 0) {
                $('#form-FocalLength #d, #form-FocalLength #n').validationEngine('hide');
                $('#form-FocalLength #resultD1').val(FocalLength.d(d, n, sr1, sr2));
            } else {
                if (n <= 1) {
                    $('#form-FocalLength #n').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
                if (d <= 0) {
                    $('#form-FocalLength #d').validationEngine('showPrompt', ' 参数限定条件：d > 0', 'error', 'topRight', true);
                }
            }
        }

    });

    //计算 f’（胶合透镜方焦距）
    $('#form-FocalLength #result-f-2').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-FocalLength input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-FocalLength').validationEngine('hideAll');

        $('#form-FocalLength #n1').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #n2').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #d1').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #d2').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr1-2').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr2-2').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr3-2').addClass('validate[required,custom[number]]');

        if (!$('#form-FocalLength #n1').validationEngine('validate') &&
            !$('#form-FocalLength #n2').validationEngine('validate') &&
            !$('#form-FocalLength #d1').validationEngine('validate') &&
            !$('#form-FocalLength #d2').validationEngine('validate') &&
            !$('#form-FocalLength #sr1-2').validationEngine('validate') &&
            !$('#form-FocalLength #sr2-2').validationEngine('validate') &&
            !$('#form-FocalLength #sr3-2').validationEngine('validate')
        ) {
            var n1 = Number($('#form-FocalLength #n1').val());
            var n2 = Number($('#form-FocalLength #n2').val());
            var d1 = Number($('#form-FocalLength #d1').val());
            var d2 = Number($('#form-FocalLength #d2').val());
            var sr1 = Number($('#form-FocalLength #sr1-2').val());
            var sr2 = Number($('#form-FocalLength #sr2-2').val());
            var sr3 = Number($('#form-FocalLength #sr3-2').val());

            if (n1 > 1 && n2 > 1 && d1 > 0 && d2 > 0) {
                $('#form-FocalLength #d, #form-FocalLength #n').validationEngine('hide');
                $('#form-FocalLength #resultF2').val(FocalLength.f2(d1 + d2, FocalLength.f1(d1, n1, sr1, sr2), FocalLength.f1(d2, n2, sr2, sr3)));
            } else {
                if (n1 <= 1) {
                    $('#form-FocalLength #n1').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
                if (n2 <= 1) {
                    $('#form-FocalLength #n2').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
                if (d1 <= 0) {
                    $('#form-FocalLength #d1').validationEngine('showPrompt', ' 参数限定条件：d > 0', 'error', 'topRight', true);
                }
                if (d2 <= 0) {
                    $('#form-FocalLength #d2').validationEngine('showPrompt', ' 参数限定条件：d > 0', 'error', 'topRight', true);
                }
            }
        }

    });

    //计算 f’（胶合透镜方焦距）
    $('#form-FocalLength #result-d-2').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-FocalLength input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-FocalLength').validationEngine('hideAll');

        $('#form-FocalLength #n1').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #n2').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #d1').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #d2').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr1-2').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr2-2').addClass('validate[required,custom[number]]');
        $('#form-FocalLength #sr3-2').addClass('validate[required,custom[number]]');

        if (!$('#form-FocalLength #n1').validationEngine('validate') &&
            !$('#form-FocalLength #n2').validationEngine('validate') &&
            !$('#form-FocalLength #d1').validationEngine('validate') &&
            !$('#form-FocalLength #d2').validationEngine('validate') &&
            !$('#form-FocalLength #sr1-2').validationEngine('validate') &&
            !$('#form-FocalLength #sr2-2').validationEngine('validate') &&
            !$('#form-FocalLength #sr3-2').validationEngine('validate')
        ) {
            var n1 = Number($('#form-FocalLength #n1').val());
            var n2 = Number($('#form-FocalLength #n2').val());
            var d1 = Number($('#form-FocalLength #d1').val());
            var d2 = Number($('#form-FocalLength #d2').val());
            var sr1 = Number($('#form-FocalLength #sr1-2').val());
            var sr2 = Number($('#form-FocalLength #sr2-2').val());
            var sr3 = Number($('#form-FocalLength #sr3-2').val());

            if (n1 > 1 && n2 > 1 && d1 > 0 && d2 > 0) {
                $('#form-FocalLength #d, #form-FocalLength #n').validationEngine('hide');
                //bfl =f’(1-d/f1’)，  f1’是第一片透镜的焦距；
                var f = FocalLength.f2(d1 + d2, FocalLength.f1(d1, n1, sr1, sr2), FocalLength.f1(d2, n2, sr2, sr3));
                var f1 = FocalLength.f1(d1, n1, sr1, sr2);
                $('#form-FocalLength #resultD2').val(FocalLength.d2(f, d1+d2, f1));
            } else {
                if (n1 <= 1) {
                    $('#form-FocalLength #n1').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
                if (n2 <= 1) {
                    $('#form-FocalLength #n2').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
                if (d1 <= 0) {
                    $('#form-FocalLength #d1').validationEngine('showPrompt', ' 参数限定条件：d > 0', 'error', 'topRight', true);
                }
                if (d2 <= 0) {
                    $('#form-FocalLength #d2').validationEngine('showPrompt', ' 参数限定条件：d > 0', 'error', 'topRight', true);
                }
            }
        }

    });

    /**************************
     * 中心偏差计算
     *************************/
    var CenterDeviation = {
        //计算中心偏差C
        //c=0.29(n-1)×lf’×δ×0.001
        c1: function(n, f, a) {
            return 0.29 * (n - 1) * f * a * 0.001;
        },
        //计算面倾角δ(偏差角度分值)
        //δ=c/[0.29(n-1)*lf’*0.001]
        a: function(c, n, f) {
            return c / (0.29 * (n - 1) * f * 0.001);
        },
        //计算中心偏差C
        //c=0.29(n-1)×lf’×60×arctg(Δt/Φ)×0.001
        c2: function(n, f, t, d) {
            return 0.29 * (n - 1) * f * 60 * Math.atan(t / d) * 0.001;
        },
        //计算边缘厚度差Δt
        //Δt=Φ*tan[c/(0.001*0.29*(n-1)*lf'*60)]
        t: function(d, c, n, f) {
            return d * Math.tan(c / (0.001 * 0.29 * (n - 1) * f * 60));
        }
    };
    //计算中心偏差C
    $('#form-CenterDeviation #result-c-1').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-CenterDeviation input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-CenterDeviation').validationEngine('hideAll');

        $('#form-CenterDeviation #n').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #f1').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #a').addClass('validate[required,custom[number]]');

        if (!$('#form-CenterDeviation #n').validationEngine('validate') &&
            !$('#form-CenterDeviation #f1').validationEngine('validate') &&
            !$('#form-CenterDeviation #a').validationEngine('validate')
        ) {
            var n = Number($('#form-CenterDeviation #n').val());
            var f = Number($('#form-CenterDeviation #f1').val());
            var a = Number($('#form-CenterDeviation #a').val());

            if (n > 1) {
                $('#form-CenterDeviation #n').validationEngine('hide');
                $('#form-CenterDeviation #resultC1').val(CenterDeviation.c1(n, f, a));
            } else {
                if (n <= 1) {
                    $('#form-CenterDeviation #n').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
            }
        }

    });
    //计算面倾角δ
    $('#form-CenterDeviation #result-a').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-CenterDeviation input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-CenterDeviation').validationEngine('hideAll');

        $('#form-CenterDeviation #n').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #f1').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #c1').addClass('validate[required,custom[number]]');

        if (!$('#form-CenterDeviation #n').validationEngine('validate') &&
            !$('#form-CenterDeviation #f1').validationEngine('validate') &&
            !$('#form-CenterDeviation #c1').validationEngine('validate')
        ) {
            var n = Number($('#form-CenterDeviation #n').val());
            var f = Number($('#form-CenterDeviation #f1').val());
            var c = Number($('#form-CenterDeviation #c1').val());

            if (n > 1) {
                $('#form-CenterDeviation #n').validationEngine('hide');
                $('#form-CenterDeviation #resultA').val(CenterDeviation.a(c, n, f));
            } else {
                if (n <= 1) {
                    $('#form-CenterDeviation #n').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
            }
        }

    });
    //计算中心偏差C
    $('#form-CenterDeviation #result-c-2').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-CenterDeviation input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-CenterDeviation').validationEngine('hideAll');

        $('#form-CenterDeviation #n').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #f2').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #t').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #d').addClass('validate[required,custom[number]]');

        if (!$('#form-CenterDeviation #n').validationEngine('validate') &&
            !$('#form-CenterDeviation #d').validationEngine('validate') &&
            !$('#form-CenterDeviation #f2').validationEngine('validate') &&
            !$('#form-CenterDeviation #t').validationEngine('validate')
        ) {
            var n = Number($('#form-CenterDeviation #n').val());
            var f = Number($('#form-CenterDeviation #f2').val());
            var t = Number($('#form-CenterDeviation #t').val());
            var d = Number($('#form-CenterDeviation #d').val());

            if (n > 1) {
                $('#form-CenterDeviation #n').validationEngine('hide');
                $('#form-CenterDeviation #resultC2').val(CenterDeviation.c2(n, f, t, d));
            } else {
                if (n <= 1) {
                    $('#form-CenterDeviation #n').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
            }
        }

    });
    //计算边缘厚度差Δt
    $('#form-CenterDeviation #result-t').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-CenterDeviation input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-CenterDeviation').validationEngine('hideAll');

        $('#form-CenterDeviation #n').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #f2').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #c2').addClass('validate[required,custom[number]]');
        $('#form-CenterDeviation #d').addClass('validate[required,custom[number]]');

        if (!$('#form-CenterDeviation #n').validationEngine('validate') &&
            !$('#form-CenterDeviation #d').validationEngine('validate') &&
            !$('#form-CenterDeviation #f2').validationEngine('validate') &&
            !$('#form-CenterDeviation #c2').validationEngine('validate')
        ) {
            var d = Number($('#form-CenterDeviation #d').val());
            var c = Number($('#form-CenterDeviation #c2').val());
            var n = Number($('#form-CenterDeviation #n').val());
            var f = Number($('#form-CenterDeviation #f2').val());

            if (n > 1) {
                $('#form-CenterDeviation #n').validationEngine('hide');
                $('#form-CenterDeviation #resultT').val(CenterDeviation.t(d, c, n, f));
            } else {
                if (n <= 1) {
                    $('#form-CenterDeviation #n').validationEngine('showPrompt', ' 参数限定条件：n > 1', 'error', 'topRight', true);
                }
            }
        }

    });

    /**************************
     * 倒角相关
     *************************/
    var Chamfer = {
        //计算β（面切线方向与零件外圆夹角角度）
        //β=arccos(Φ/2/SR）
        b: function(r, d) {
            return Math.acos(d / 2 / r);
        },
        //计算α倒角角度
        //当Φ/SR＜0.7时，α=45°，当0.7≤Φ/SR＜1.5时，α=30°，当1.5≤Φ/SR＜2时，α=不倒角
        a: function(r, d) {
            var c = Chamfer.c(r, d);
            if (c < 0.7) {
                return 45;
            }
            if (c >= 0.7 && c < 1.5) {
                return 30;
            }
            if (c >= 1.5 && c < 2) {
                return '不倒角';
            }
        },
        c: function(r, d) {
            return d / r;
        }
    };
    //计算β（面切线方向与零件外圆夹角角度）
    $('#form-Chamfer #result-b').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-CenterDeviation input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-Chamfer').validationEngine('hideAll');

        $('#form-Chamfer #r').addClass('validate[required,custom[number]]');
        $('#form-Chamfer #d').addClass('validate[required,custom[number]]');

        if (!$('#form-Chamfer #r').validationEngine('validate') &&
            !$('#form-Chamfer #d').validationEngine('validate')
        ) {
            var r = Number($('#form-Chamfer #r').val());
            var d = Number($('#form-Chamfer #d').val());

            if (r > 0 && d > 0) {
                $('#form-Chamfer #r, #form-Chamfer #d').validationEngine('hide');
                $('#form-Chamfer #resultB').val(Chamfer.b(r, d) * 180);
            } else {
                if (r <= 0) {
                    $('#form-Chamfer #r').validationEngine('showPrompt', ' 参数限定条件：r > 0', 'error', 'topRight', true);
                }
                if (d <= 0) {
                    $('#form-Chamfer #d').validationEngine('showPrompt', ' 参数限定条件：d > 0', 'error', 'topRight', true);
                }
            }
        }

    });
    //计算α倒角角度
    $('#form-Chamfer #result-a').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-CenterDeviation input').each(function(data, i) {
            removeValidateRule($(this));
        });
        $('#form-Chamfer').validationEngine('hideAll');

        $('#form-Chamfer #r').addClass('validate[required,custom[number]]');
        $('#form-Chamfer #d').addClass('validate[required,custom[number]]');

        if (!$('#form-Chamfer #r').validationEngine('validate') &&
            !$('#form-Chamfer #d').validationEngine('validate')
        ) {
            var r = Number($('#form-Chamfer #r').val());
            var d = Number($('#form-Chamfer #d').val());

            if (r > 0 && d > 0) {
                $('#form-Chamfer #r, #form-Chamfer #d').validationEngine('hide');
                $('#form-Chamfer #ref').val(Chamfer.c(r, d));
                $('#form-Chamfer #resultA').val(Chamfer.a(r, d));
            } else {
                if (r <= 0) {
                    $('#form-Chamfer #r').validationEngine('showPrompt', ' 参数限定条件：r > 0', 'error', 'topRight', true);
                }
                if (d <= 0) {
                    $('#form-Chamfer #d').validationEngine('showPrompt', ' 参数限定条件：d > 0', 'error', 'topRight', true);
                }
            }
        }

    });

    /**************************
     * 角度长度换算
     *************************/
    var Switch = {
        //角度转换
        //度=角度的整数部分；分=（角度的小数部分*60）的整数部分；秒=分的小数部分*60；
        angleA: function(a) {
            var h = Math.floor(a);
            var m = Math.floor((a - h) * 60);
            var s = Math.round(((a - h) * 60 - m) * 60);
            return {
                h: h,
                m: m,
                s: s
            }
        },
        //角度=度+（分+秒/60）/60"
        angleB: function(h,m,s) {
            return h + (m + s / 60) / 60;
        },
        //弧度=（角度/180）*3.1415926；
        a2r: function(a) {
            return a / 180 * Math.PI;
        },
        //角度=（弧度/3.1415926）*180
        r2a: function(r) {
            return r / Math.PI * 180;
        },
        //毫米=25.4*英寸；
        i2m: function(i) {
            return 25.4 * i;
        },
        //英寸=毫米/25.4
        m2i: function(m) {
            return m / 25.4;
        },
        //屈光度转焦距 焦距=1000/屈光度；
        d2f: function(d) {
            return 1000 / d;
        },
        //屈光度=1000/焦距
        f2d: function(f) {
            return 1000 / f;
        }
    };
    //角度转化为度，分，秒
    $('#form-Switch #switchA').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-Switch input').each(function(data, i) {
            removeValidateRule($(this));
        });

        $('#form-Switch #a1').addClass('validate[required,min[0],custom[number]]');

        if (!$('#form-Switch #a1').validationEngine('validate') 
        ) {
            console.log('ok');
            var a = Number($('#form-Switch #a1').val());

            if (a >= 0) {
                $('#form-Switch #a1').validationEngine('hide');
                var result = Switch.angleA(a);

                $('#form-Switch #h').val(result.h);
                $('#form-Switch #m').val(result.m);
                $('#form-Switch #s').val(result.s);
            } else {
                if (a < 0) {
                    $('#form-Switch #a1').validationEngine('hide');
                    $('#form-Switch #a1').validationEngine('showPrompt', ' 参数限定条件：a >= 0', 'error', 'topRight', true);
                }
            }
        }

    });
    //度，分，秒的角度转换
    $('#form-Switch #switchB').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-Switch input').each(function(data, i) {
            removeValidateRule($(this));
        });

        $('#form-Switch #h').addClass('validate[min[0],custom[number]]');
        $('#form-Switch #m').addClass('validate[min[0],custom[number]]');
        $('#form-Switch #s').addClass('validate[min[0],custom[number]]');

        if (!$('#form-Switch #h').validationEngine('validate')  &&
            !$('#form-Switch #m').validationEngine('validate')  &&
            !$('#form-Switch #s').validationEngine('validate')
        ) {
            var h = Number($('#form-Switch #h').val());
            var m = Number($('#form-Switch #m').val());
            var s = Number($('#form-Switch #s').val());

            $('#form-Switch #a1').val( Switch.angleB(h,m,s));
        }

    });

    //角度 -> 弧度
    $('#form-Switch #switchC').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-Switch input').each(function(data, i) {
            removeValidateRule($(this));
        });

        $('#form-Switch #a2').addClass('validate[required,custom[number]]');

        if (!$('#form-Switch #a2').validationEngine('validate') 
        ) {
            var a = Number($('#form-Switch #a2').val());
            $('#form-Switch #r').val(Switch.a2r(a));
        }
    });
    //弧度 -> 角度
    $('#form-Switch #switchD').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-Switch input').each(function(data, i) {
            removeValidateRule($(this));
        });

        $('#form-Switch #r').addClass('validate[required,custom[number]]');

        if (!$('#form-Switch #r').validationEngine('validate') 
        ) {
            var r = Number($('#form-Switch #r').val());
            $('#form-Switch #a2').val(Switch.r2a(r));
        }
    });

    //英寸 -> 毫米
    $('#form-Switch #switchE').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-Switch input').each(function(data, i) {
            removeValidateRule($(this));
        });
        // $('#form-Switch').validationEngine('hideAll');

        $('#form-Switch #i').addClass('validate[required,min[0],custom[number]]');

        if (!$('#form-Switch #i').validationEngine('validate')
        ) {
            var i = Number($('#form-Switch #i').val());

            $('#form-Switch #mm').val( Switch.i2m(i));
        }

    });

    //毫米 -> 英寸
    $('#form-Switch #switchF').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-Switch input').each(function(data, i) {
            removeValidateRule($(this));
        });

        $('#form-Switch #mm').addClass('validate[required,min[0],custom[number]]');

        if (!$('#form-Switch #mm').validationEngine('validate')
        ) {
            var mm = Number($('#form-Switch #mm').val());
            $('#form-Switch #i').val( Switch.m2i(mm));
        }

    });

    //屈光度转焦距
    $('#form-Switch #switchG').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-Switch input').each(function(data, i) {
            removeValidateRule($(this));
        });

        $('#form-Switch #d').addClass('validate[required,custom[number]]');

        if (!$('#form-Switch #d').validationEngine('validate')
        ) {
            var d = Number($('#form-Switch #d').val());
            $('#form-Switch #f').val( Switch.d2f(d));
        }

    });
    //焦距转屈光度
    $('#form-Switch #switchH').on('click', function(e) {
        e.preventDefault();
        //移除之前的验证规则
        $('#form-Switch input').each(function(data, i) {
            removeValidateRule($(this));
        });

        $('#form-Switch #f').addClass('validate[required,custom[number]]');

        if (!$('#form-Switch #f').validationEngine('validate')
        ) {
            var f = Number($('#form-Switch #f').val());
            $('#form-Switch #d').val( Switch.f2d(f));
        }

    });

    var Arrangement = {
        dis: function(d) {
            return 0.05 * d;
        },
        //D=（2*m-1)*Φ+2*（m-1）*0.05*Φ
        c1: function (d, m) {
            return (2 * m - 1) * d + 2* (m-1) * 0.05 * d;
        },
        //D=2[(m+(0.134*Φ+0.05*Φ）/1.732）*Φ+（m-1）*0.05*Φ]
        c3: function(d, m) {
            return 2 * ( (m + (0.134* d + 0.05 * d) / 1.732) * d + (m-1) * 0.05 * d);
        },
        //D=2[(m+(0.293*Φ+0.05*Φ）/1.414）*Φ+（m-1）*0.05*Φ]
        c4: function(d, m) {
            return 2 * ( ( m + (0.293 * d + 0.05 * d) / 1.414) * d + (m-1) * 0.05 * d);
        },
        //排列方法：1个 D=（2*m-1)*Φ+2*（m-1）*0.05*Φ；d=0.05*Φ
        '1-1': '1个',
        '3-1': '3个',
        '4-1': '4个',
        '1-2': '1+6=7个',
        '3-2': '3+9=12个',
        '4-2': '4+10=14个',
        '1-3': '1+6+12=19个',
        '3-3': '3+9+15=27个',
        '4-3': '4+10+17=31个',
        '1-4': '1+6+12+18=37个',
        '3-4': '3+9+15+22=49个',
        '4-4': '4+10+17+23=54个',
        '1-5': '1+6+12+18+25=62个',
        '3-5': '3+9+15+22+28=77个',
        '4-5': '4+10+17+23+29=83个',
        '1-6': '1+6+12+18+25+31=93个',
        '3-6': '3+9+15+22+28+34=111个',
        '4-6': '4+10+17+23+29+35=118个',
        '1-7': '1+6+12+18+25+31+37=130个',
        '3-7': '3+9+15+22+28+34+41=152个',
        '4-7': '4+10+17+23+29+35+42=160个',
        '1-8': '1+6+12+18+25+31+37+43=173个',
        '3-8': '3+9+15+22+28+34+41+47=199个',
        '4-8': '4+10+17+23+29+35+42+48=208个',
        '1-9': '1+6+12+18+25+31+37+43+50=223个',
        '3-9': '3+9+15+22+28+34+41+47+53=252个',
        '4-9': '4+10+17+23+29+35+42+48+54=262个',
        '1-10': '1+6+12+18+25+31+37+43+50+56=279个',
        '3-10': '3+9+15+22+28+34+41+47+53+59=311个',
        '4-10': '4+10+17+23+29+35+42+48+54+60=322个',
        '1-11': '1+6+12+18+25+31+37+43+50+56+62=341个',
        '3-11': '3+9+15+22+28+34+41+47+53+59+66=377个',
        '4-11': '4+10+17+23+29+35+42+48+54+60+67=389个',
        '1-12': '1+6+12+18+25+31+37+43+50+56+62+68=409个',
        '3-12': '3+9+15+22+28+34+41+47+53+59+66+72=449个',
        '4-12': '4+10+17+23+29+35+42+48+54+60+67+73=462个'
    };
    $('#form-Arrangement #d').on('change', function(){
        $('#form-Arrangement input').each(function(data, i) {
            removeValidateRule($(this));
        });

        $('#form-Arrangement #d').addClass('validate[required,custom[number]]');

        if (!$('#form-Arrangement #d').validationEngine('validate')
        ) {
            var d = Number($('#form-Arrangement #d').val());
            $('#form-Arrangement #dis').val( Arrangement.dis(d));
        }
    });

    $('#form-Arrangement #c').on('change', function(){
        $('#form-Arrangement input').each(function(data, i) {
            removeValidateRule($(this));
        });

        $('#form-Arrangement #d').addClass('validate[required,custom[number]]');
        $('#form-Arrangement #c').addClass('validate[required]');

        if (!$('#form-Arrangement #d').validationEngine('validate') &&
            !$('#form-Arrangement #c').validationEngine('validate')
        ) {
            var d = Number($('#form-Arrangement #d').val());
            var c = $('#form-Arrangement #c').val();
            var m = c.split('-')[0];
            $('#form-Arrangement #m').val( Arrangement[c]);
            $('#form-Arrangement #Di').val(Arrangement['c'+ m](d, m));
        }
    });


})(jQuery);
