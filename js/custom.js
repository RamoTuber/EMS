
var loadFile = function(event, element) {
	var output = document.getElementById(element);
	output.src = URL.createObjectURL(event.target.files[0]);

	output.onload = function() {
		output.width = output.naturalWidth;
		output.height = output.naturalHeight;
	}
};

function getForm() { 
	$(document).on('click', ".section-wrapper", function(){
		var id = $(this).attr('id');
		var idTrim = id.substr(id.length - 9);

		$(".section-wrapper").css('opacity', '.4');
		$(".section-wrapper").removeClass('activeComp', 1000);
		$(this).addClass('activeComp', 1000);

		$(".form").hide();
		$("#form"+idTrim).show();
		
		// $(".form-wrapper").load("../form-"+idTrim+".html");
		// $(".form"+idTrim).remove().not($("#form" + idTrim));
	});
}

function loadDesign() {
	$(document).on('click', '.ds-temp', function() {
		var id = $(this).attr('id');
		var idTrim = id.substr(id.length - 7);

		$(".editor-wrapper").css("right", "0");
		setTimeout(function(){
			$('.active_menu').addClass('bounceIn');
		}, 1000);

		$(".ds-comps, .home-page").hide();
		$(".instructor-1, #ds-"+idTrim).show(100);
	});
}

function addLink() {
	var link = "";
  
  $("#link").focusout(function() {
  	link = $(this).val();
  });
  
  $('#button').click(function() {
  	document.execCommand('CreateLink', false, link);
  	document.execCommand('bold');
  });

  $('#link_btn').click(function() {
  	$('.addLink').toggleClass('active_link');
  });
}

function getSelectedText() {
        var text = "";
        if (typeof window.getSelection != "undefined") {
            text = window.getSelection().toString();
        } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
            text = document.selection.createRange().text;
        }
        return text;
    }
    
    function doSomethingWithSelectedText() {
        var selectedText = getSelectedText();
        if (selectedText) {
            $('.addLink').addClass('active_link');
        }
    }
    
    document.onmouseup = doSomethingWithSelectedText;
    document.onkeyup = doSomethingWithSelectedText;

function getCode(){
	$('.btn-gen').click(function(){
		var extract = $('.email-extract').html();
		$('.code').text(extract);
		$('.disable-page, .raw-html').show();
	});

	$('.close').click(function() {
		$('.raw-html, .disable-page').hide();
	});

	$('.btn-preview').click(function() {
		$('.section-wrapper').css('opacity', '1').removeClass('activeComp');
	});
}

function genBtn() {
	var active = 0;
	var imageUrl = '';

	$('.btn-wrapper span').click(function(){

		if(active == 0) {
			$('.btn-wrapper').animate({
				bottom: 0
			},300);
			active = 1;
			imageUrl = '../assets/icons/close.png';
			$(this).css('background-image', 'url(' + imageUrl + ')');	
		} else {
			$('.btn-wrapper').animate({
				bottom: '-52px'
			},300);
			active = 0;
			imageUrl = '../assets/icons/open.png';
			$(this).css('background-image', 'url(' + imageUrl + ')');	
		}
	});
}

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
  $('.alert_copy').fadeIn().delay(2000).fadeOut();
}

function activate_menu() {
	var active = 0;

	$('.active_menu').click(function () {
		if(active == 0) {
			$('.pre_wrapper').animate({left:0}, 150);
			$(this).addClass("xs-btn");
			active = 1;
		} else {
			$('.pre_wrapper').animate({left:'-230px'}, 150);
			$(this).removeClass("xs-btn");
			active=0;
		}
		
	});
}

function addUrl(id) {
    var textArea = $('#editor-'+id);
    var url = $('#text_link-' + id).val();
    var start = textArea[0].selectionStart;
    var end = textArea[0].selectionEnd;
    var replacement = '<a href="'+url+'">' + textArea.val().substring(start, end) + '</a>';
    textArea.val(textArea.val().substring(0, start) + replacement + textArea.val().substring(end, textArea.val().length));
}

function addPre(id) {
    var textArea = $('#editor-' + id);
    var pre = $('#text_link-' + id).val();
    var start = textArea[0].selectionStart;
    var end = textArea[0].selectionEnd;
    var replacement = '<pre>' + textArea.val().substring(start, end) + '</pre>';
    textArea.val(textArea.val().substring(0, start) + replacement + textArea.val().substring(end, textArea.val().length));
}

function addCol(id) {
    var textArea = $('#editor-' + id);
    var color = $('#col-pal-' + id).val();
    var start = textArea[0].selectionStart;
    var end = textArea[0].selectionEnd;
    var replacement = '<span style="color:' + color + '">' + textArea.val().substring(start, end) + '</span>';
    textArea.val(textArea.val().substring(0, start) + replacement + textArea.val().substring(end, textArea.val().length));
}

//removes all comments in generated code
function cleanCode() {
	$('#clean').click(function() {
		$("#code").text($("#code").text().replace(/<!--(?!\s*(?:\[if [^\]]+]|<!|>))(?:(?!-->)(.|\n))*-->/g,""));
		//$('#code').text($("div.section-wrapper").replaceWith(" "));
	});
}

//reveal text symbols
function textSymbols() {
	var active = 0;
	$('.txt_sym_link').click(function() {
		if(active == 0) {
			$(this).parent().animate({
				width:'100%',
				height:'100%'
			}, 120);
			active = 1;
		} else {
			$(this).parent().animate({
				width:'28px',
				height:'28px'
			}, 120);
			active = 0;
		}
	});
}

$(document).ready(function() {

	$('#copy').click(function(){
		copyToClipboard('#code');
	});

	$('.add_link').click(function() {
		var id = $(this).attr('id');
		addUrl(id);
	});

	$('.add_pre').click(function() {
		var id = $(this).attr('id');
		addPre(id);
	});

	$('.add_col').click(function() {
		var id = $(this).attr('id');
		addCol(id);
	});

	activate_menu();
	getForm();
	loadDesign();
	addLink();
	getCode();
	cleanCode();
	genBtn();
	textSymbols()
});