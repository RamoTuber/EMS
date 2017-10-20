
(function() {
	'use strict'; 

	/*application*/
	var app = angular.module('email', []);

	app.controller('AppController', function($scope) {
		var vm = this;

		// I am the content being rendered by the ngModel binding(s).
        vm.content = "Jelly-o sweet topping jelly cotton candy biscuit lollipop. *Muffin* tart candy canes cake. Marshmallow lollipop _topping dessert pie_. Cheesecake wafer sweet <a href='http://www.cupcakeipsum.com/'>marshmallow</a> chupa chups.";
	});

	// I provide a super simplistic mark-down input that supports bold and italic.
    angular.module( "email" ).directive(
      "markyMark",
      function markyMarkDirective( htmlUtil ) {

        // Return the directive configuration object.
        return({
          link: link,
          require: "ngModel",
          restrict: "E",
          template: "<div contenteditable='true' class='content'></div>"
        });


        // I bind the JavaScript events to the view-model.
        function link( scope, element, attributes, ngModelController ) {

          var content = element.find( "div" );

          // When the ngModel / $modelValue value needs to be synchronized 
          // into the $viewValue / input control, it is passed through a 
          // collection of formatters (in reverse order) before the $render() 
          // method is invoked.
          // --
          // ngModel --> $modelValue --> Formatters --> $viewValue --> $render().
          ngModelController.$formatters.push( formatInput );
          ngModelController.$render = renderViewValue;

          // When the $viewValue change is emitted, it is run through a 
          // collection of parsers (in order) before the value is saved to the
          // $modelValue and synchronized out to the ngModel binding.
          // --
          // Widget --> $viewValue --> Parsers --> $modelValue --> ngModel.
          ngModelController.$parsers.push( parseOutput );

          // To keep this super simple, we're going to prevent paste events 
          // and line-breaks on the contentEditable area. This is not a robust
          // demo, so it just keeps the output simple.
          element.on( "keydown", preventLineBreak );
          element.on( "paste", preventPaste );

          // We're going to emit the changed $viewValue on each keyup event.
          // Doing this will push the $viewValue value through the parsers
          // before it is synchronized out to the $modelValue and the ngModel
          // binding.
          element.on( "keyup", emitMarkupChange );


          // ---
          // PRIVATE METHODS.
          // ---


          // As the user types, they are actively changing the DOM structure
          // of the widget which represents our view-value. As such, we have 
          // to let the ngModelController know about the updated value.
          function emitMarkupChange( event ) {

            scope.$apply(
              function changeModel() {

                // NOTE: Logging to demonstrate debounce options.
                console.log( "Calling $setViewValue() with:", content.html() );

                // NOTE: This will cause our parsers to be called before
                // the value is synchronized out to the ngModel.
                ngModelController.$setViewValue( content.html() );

              }
            );

          }


          // I format the incoming ngModel / $modelValue value that needs to be
          // synchronized into the $viewValue / widget rendering.
          // --
          // ngModel --> $modelValue --> [[[ Formatters ]]] --> $viewValue --> $render().
          function formatInput( value ) {

            var inItalic = false;
            var inBold = false;

            // Iterate over the meaningful character matches to replace them
            // with valid HTML markup tags.
            value = value.replace(
              /(?:\\([\\_*]))|([_*])/g,
              function operator( $0, escapedToken, token ) {

                if ( escapedToken ) {

                  return( escapedToken );

                } else if ( token === "*" ) {

                  if ( inBold ) {

                    inBold = false;
                    return( "</b>" );

                  } else {

                    inBold = true;
                    return( "<b>" );

                  }

                } else if ( token === "_" ) {

                  if ( inItalic ) {

                    inItalic = false;
                    return( "</i>" );

                  } else {

                    inItalic = true;
                    return( "<i>" );

                  }

                } else {

                  return( htmlUtil.escapeHtml( $0 ) );

                }

              }
            );

            // Close any outstanding tags.
            // --
            // CAUTION: For this simplistic demo, we're not going to worry 
            // about the order of the unclosed tags.
            ( inBold && ( value += "</b>" ) );
            ( inItalic && ( value += "</i>" ) );

            // Return the formatted value. 
            return( value );

          }


          // I parse the outgoing $viewValue for use in the $modelValue / ngModel.
          // --
          // Widget --> $viewValue --> [[[ Parsers ]]] --> $modelValue --> ngModel.
          function parseOutput( value ) {

            // NOTE: Logging to demonstrate debounce options.
            console.log( "Parser called." );

            return( 
              domToString(
                angular.element( "<div />" )
                  .html( value )
                  .prop( "childNodes" )
              ) 
            );


            // I convert the given DOM node collection into an marky-markdown
            // input value (which is basically a barely-functional markdown).
            function domToString( nodes ) {

              var buffer = [];

              for ( var i = 0, length = nodes.length ; i < length ; i++ ) {

                var node = nodes[ i ];

                if ( ! htmlUtil.isElement( node ) ) {

                  // Escape any embedded special characters.
                  buffer.push( node.nodeValue.replace( /([_*\\])/g, "\\$1" ) );

                } else if (  htmlUtil.isBold( node ) ) {

                  buffer.push( "*" );
                  buffer.push( domToString( node.childNodes ) );
                  buffer.push( "*" );

                } else if (  htmlUtil.isItalic( node ) ) {

                  buffer.push( "_" );
                  buffer.push( domToString( node.childNodes ) );
                  buffer.push( "_" );

                } else {

                  // For the purposes of this demo, we're just going to
                  // keep the parser super super super simple and just
                  // ignore everything but the bold and italic tags.
                  // --
                  // NOTE: Since we also suppressing the line-return and
                  // paste events, this should be totally fine for our
                  // demo purposes.
                  buffer.push( domToString( node.childNodes ) );

                }

              }

              return( buffer.join( "" ) );

            }

          }


          // I prevent the paste event on the input.
          // --
          // NOTE: Done to keep the demo super simple.
          function preventPaste( event ) {

            event.preventDefault();

          }


          // I prevent line-breaks on the input.
          // --
          // NOTE: Done to keep the demo super simple.
          function preventLineBreak( event ) {

            if ( event.which === 13 ) {

              event.preventDefault();

            }

          }


          // I get called when the $viewValue has been changed programmtically
          // from the outside (ie, via the ngModel binding) and needs to be 
          // synchronized into the widget. At this point, the formatters have
          // all been called and the $viewValue should be considered ready to 
          // consume in the widget.
          function renderViewValue() {

            content.html( ngModelController.$viewValue );

          }

        }

      }
    );

	// I provide some HTML-based utilities.
    angular.module( "email" ).factory(
      "htmlUtil",
      function htmlUtilFactory() {

        // Return the pulic API.
        return({
          escapeHtml: escapeHtml,
          isBold: isBold,
          isElement: isElement,
          isItalic: isItalic,
          isTagType: isTagType
        });


        // ---
        // PUBLIC METHODS.
        // ---


        // I escape the given HTML so that it can be rendered as text.
        function escapeHtml( html ) {

          html = html.replace( /&(?!amp;)/g, "&amp;" );
          html = html.replace( /</g, "&lt;" );
          html = html.replace( />/g, "&gt;" );

          return( html );

        }


        // I determine if the given node is a bold(esque) tag.
        function isBold( node ) {

          return( isTagType( node, [ "b", "strong" ] ) );

        }


        // I determine if the given node is an Element node.
        function isElement( node ) {

          return( node.nodeType === 1 );

        }


        // I determine if the given node is an italic(esque) tag.
        function isItalic( node ) {

          return( isTagType( node, [ "em", "i" ] ) );

        }


        // I determine if the given node is one of the given types.
        function isTagType( node, tagNames ) {

          var isAnyMatch = tagNames.some(
            function iterator( name ) {

              return( name.toUpperCase() === node.tagName );

            }
          );

          return( isAnyMatch );

        }

      }
    );


    // --------------------------------------------------------------------------- //
    // --------------------------------------------------------------------------- //

	/*controller*/
	app.controller('componentController', function($scope, $compile) {


		/*add properties to the controller here*/
		this.component = components;
		this.tempTwo = temp2;
		$scope.appendComp = function($id){
			$('#email-template').append("<div class='section-wrapper' id='section"+$id+"'></div>");
	      var compiledHTML = $compile("<section-"+$id+" class='section'></section-"+$id+">")($scope);
	      $("#section" + $id).append(compiledHTML);
	    };

	    $scope.appendForm - function(id) {
	    	//var id = $(this).attr('id');
			var idTrim = id.substr(id.length - 9);

			$(".section-wrapper").removeClass('activeComp', 1000);
			$(this).addClass('activeComp', 1000);
			
			$(".form-wrapper").load("../form-"+idTrim+".html");
			$(".form"+idTrim).remove().not($("#form" + idTrim));
		};

		$scope.vm.content1B = $scope.vm.contentC1 = $scope.cp2TitleDark = $scope.vm.contentE1 = $scope.cp4TitleDark = $scope.cp4bTitleDark = $scope.vm.title5a = $scope.vm.title5b = $scope.vm.title5c = $scope.cp6TitleDark = $scope.cp7TitleDark = $scope.vm.titleJ1 = $scope.cp10TitleDark = $scope.cp11TitleDark = $scope.cp12aTitleDark = $scope.cp12bTitleDark = $scope.cp13aTitleDark = $scope.cp13bTitleDark = $scope.cp13cTitleDark = $scope.cp15aTitleDark = $scope.cp15bTitleDark = $scope.vm.content16a = $scope.vm.content16b = $scope.cp16TitleDark = $scope.vm.content18 = "Your Title Here";
		$scope.vm.content1A = $scope.contentA9 = $scope.contentA8 = $scope.contentA7 = $scope.link1Content = $scope.link2Content = $scope.link3Content = $scope.linkContent10 = $scope.linkContent11 = $scope.cp16aLink1 = $scope.cp16aLink2 = $scope.cp16aLink3 = $scope.cp16aLink4 = $scope.cp16bLink1 = $scope.cp16bLink2 = $scope.cp16bLink3 = $scope.cp16bLink4 = $scope.cp18Link1 = $scope.cp18Link2 = "link here";
		$scope.vm.contentC2 = $scope.vm.content2 = $scope.vm.content3 = $scope.vm.content4 = $scope.vm.content4b = $scope.vm.content5a = $scope.vm.content5b = $scope.vm.content5c = $scope.vm.content6 = $scope.vm.content7 = $scope.vm.content9a = $scope.vm.content9b = $scope.vm.content9c = $scope.vm.content9d = $scope.vm.content10 = $scope.vm.content11 = $scope.vm.content12a = $scope.vm.content12b = $scope.vm.content13a = $scope.vm.content13b = $scope.vm.content13c = $scope.vm.content14 = $scope.vm.content15a = $scope.vm.content15b = $scope.vm.content16c = 'Cake muffin danish. Cake toffee jelly-o sweet pudding danish. Candy cheesecake danish gummies jujubes bear claw tiramisu powder topping. Dessert carrot cake tart halvah gummies gummi bears chocolate bar.';
		$scope.iconSrc10 = "http://crm.quasargaming.com/2016/omar_test_images/calendar.png";
		$scope.sideTextTop = "30";
		$scope.sideTextbottom = "Dec";
		$scope.iconSrc12a = $scope.iconSrc12b = "http://crm.quasargaming.com/2016/omar_test_images/add.png";
		$scope.vm.content1U = "© All rights reserved 2016, eel.com.mt";
	});

	app.directive('sectionA', function() {
		return {
			restrict:'E',
			templateUrl: 'section-a.html'
		}
	});

	app.directive('sectionB', function() {
		return {
			restrict:'E',
			templateUrl: 'section-b.html'
		}
	});

	app.directive('sectionC', function() {
		return {
			restrict:'E',
			templateUrl: 'section-c.html'
		}
	});

	app.directive('sectionD', function() {
		return {
			restrict:'E',
			templateUrl: 'section-d.html'
		}
	});

	app.directive('sectionE', function() {
		return {
			restrict:'E',
			templateUrl: 'section-e.html'
		}
	});

	app.directive('sectionF', function() {
		return {
			restrict:'E',
			templateUrl: 'section-f.html'
		}
	});

	app.directive('sectionG', function() {
		return {
			restrict:'E',
			templateUrl: 'section-g.html'
		}
	});

	app.directive('sectionH', function() {
		return {
			restrict:'E',
			templateUrl: 'section-h.html'
		}
	});

	app.directive('sectionI', function() {
		return {
			restrict:'E',
			templateUrl: 'section-i.html'
		}
	});

	app.directive('sectionJ', function() {
		return {
			restrict:'E',
			templateUrl: 'section-j.html'
		}
	});

	app.directive('sectionK', function() {
		return {
			restrict:'E',
			templateUrl: 'section-k.html'
		}
	});

	app.directive('sectionL', function() {
		return {
			restrict:'E',
			templateUrl: 'section-l.html'
		}
	});

	app.directive('sectionM', function() {
		return {
			restrict:'E',
			templateUrl: 'section-m.html'
		}
	});

	app.directive('sectionN', function() {
		return {
			restrict:'E',
			templateUrl: 'section-n.html'
		}
	});

	app.directive('sectionO', function() {
		return {
			restrict:'E',
			templateUrl: 'section-o.html'
		}
	});

	app.directive('sectionP', function() {
		return {
			restrict:'E',
			templateUrl: 'section-p.html'
		}
	});

	app.directive('sectionQ', function() {
		return {
			restrict:'E',
			templateUrl: 'section-q.html'
		}
	});

	app.directive('sectionR', function() {
		return {
			restrict:'E',
			templateUrl: 'section-r.html'
		}
	});

	app.directive('sectionS', function() {
		return {
			restrict:'E',
			templateUrl: 'section-s.html'
		}
	});

	app.directive('sectionT', function() {
		return {
			restrict:'E',
			templateUrl: 'section-t.html'
		}
	});

	app.directive('sectionU', function() {
		return {
			restrict:'E',
			templateUrl: 'section-u.html'
		}
	});

	app.directive('sectionW', function() {
		return {
			restrict:'E',
			templateUrl: 'section-w.html'
		}
	});

	app.directive('sectionX', function() {
		return {
			restrict:'E',
			templateUrl: 'section-x.html'
		}
	});

	app.directive('sectionY', function() {
		return {
			restrict:'E',
			templateUrl: 'section-y.html'
		}
	});

	app.directive('sectionZ', function() {
		return {
			restrict:'E',
			templateUrl: 'section-z.html'
		}
	});


	app.directive('section0', function() {
		return {
			restrict:'E',
			templateUrl: 'section-1.html'
		}
	});

	app.directive('section1', function() {
		return {
			restrict:'E',
			templateUrl: 'section-2.html'
		}
	});

	app.directive('section2', function() {
		return {
			restrict:'E',
			templateUrl: 'section-3.html'
		}
	});

	app.directive('section3', function() {
		return {
			restrict:'E',
			templateUrl: 'section-4.html'
		}
	});

	app.directive('section4', function() {
		return {
			restrict:'E',
			templateUrl: 'section-5.html'
		}
	});

	app.directive('section5', function() {
		return {
			restrict:'E',
			templateUrl: 'section-6.html'
		}
	});

	app.directive('section6', function() {
		return {
			restrict:'E',
			templateUrl: 'section-7.html'
		}
	});

	app.directive('section7', function() {
		return {
			restrict:'E',
			templateUrl: 'section-8.html'
		}
	});

	app.directive('section8', function() {
		return {
			restrict:'E',
			templateUrl: 'section-9.html'
		}
	});

	app.directive('section9', function() {
		return {
			restrict:'E',
			templateUrl: 'section-10.html'
		}
	});

	// app.directive('contenteditable', function() {
	//   return {
	//     require: 'ngModel',
	//     link: function(scope, element, attrs, ctrl) {
	//       // view -> model
	//       element.bind('blur', function() {
	//         scope.$apply(function() {
	//           ctrl.$setViewValue(element.html());
	//         });
	//       });

	//       // model -> view
	//       ctrl.$render = function() {
	//         element.html(ctrl.$viewValue);
	//       };

	//       // load init value from DOM
	//       ctrl.$setViewValue(element.html());
	//     }
	//   };
	// });

	var components = [
		{
			id: 'B',
			src: './assets/cm-editor/thumb20.png'
		},
		{
			id: 'C',
			src: './assets/cm-editor/thumb1.png'
		},
		{
			id: 'D',
			src: './assets/cm-editor/thumb2.png'
		},
		{
			id: 'E',
			src: './assets/cm-editor/thumb3.png'
		},
		{
			id: 'F',
			src: './assets/cm-editor/thumb4.png'
		},
		{
			id: 'G',
			src: './assets/cm-editor/thumb5.png'
		},
		{
			id: 'H',
			src: './assets/cm-editor/thumb6.png'
		},
		{
			id: 'I',
			src: './assets/cm-editor/thumb7.png'
		},
		{
			id: 'J',
			src: './assets/cm-editor/thumb8.png'
		},
		{
			id: 'K',
			src: './assets/cm-editor/thumb9.png'
		},
		{
			id: 'L',
			src: './assets/cm-editor/thumb10.png'
		},
		{
			id: 'M',
			src: './assets/cm-editor/thumb11.png'
		},
		{
			id: 'N',
			src: './assets/cm-editor/thumb12.png'
		},
		{
			id: 'O',
			src: './assets/cm-editor/thumb13.png'
		},
		{
			id: 'P',
			src: './assets/cm-editor/thumb14.png'
		},
		{
			id: 'Q',
			src: './assets/cm-editor/thumb15.png'
		},
		{
			id: 'R',
			src: './assets/cm-editor/thumb16.png'
		},
		{
			id: 'S',
			src: './assets/cm-editor/thumb18.png'
		},
		{
			id: 'T',
			src: './assets/cm-editor/thumb19.png'
		},
	];

	var temp2 = [
		{
			id: '0',
			src: './assets/cm-editor/thumb30.png'
		},
		{
			id: '1',
			src: './assets/cm-editor/thumb21.png'
		},
		{
			id: '2',
			src: './assets/cm-editor/thumb22.png'
		},
		{
			id: '3',
			src: './assets/cm-editor/thumb23.png'
		},
		{
			id: '4',
			src: './assets/cm-editor/thumb24.png'
		},
		{
			id: '5',
			src: './assets/cm-editor/thumb25.png'
		},
		{
			id: '6',
			src: './assets/cm-editor/thumb26.png'
		},
		{
			id: '7',
			src: './assets/cm-editor/thumb27.png'
		},
		{
			id: '8',
			src: './assets/cm-editor/thumb28.png'
		},
		{
			id: '9',
			src: './assets/cm-editor/thumb29.png'
		}
	]; 

})();


$(document).ready(function() {

	$('.thumb').click(function() {
		$(".instructor-1").remove();
		var compId = $(this).attr('id');
		var compCount = $("#section" + compId).children(".section").length;
		
       $(this).addClass("activeThumb");
       $(this).children("span.isSelected").text(compCount);

       $(".section-wrapper").removeClass('activeComp', 1000);
       $('#section' + compId).addClass('activeComp', 1000);

       $(".form").hide();
		$("#form"+compId).show();
    });

    $(document).on('click', '.removeComp', function() {
    	var compId = $(this).attr('id');
		var compCount = $("#section" + compId).children(".section").length;
    	$('div#section' + compId).remove();
    	$('.thumb#' + compId).children("span.isSelected").text(compCount-1);
    });
});

