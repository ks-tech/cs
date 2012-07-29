		/**
		@see http://www.html5rocks.com/
		*/

      var currentSlideNo;
      var notesOn = false;
      var slides = baidu.dom.query('.slide'); //from Index
	  var slideIndexList = ['占位'];	//['#xxx', '#slide24'] //IndexOfId
	  var slideList = {};	//idForDom

      // var slide_hash = window.location.hash.replace(/#/, '');
      // if (slide_hash) {
      //   for (var i = 0, len = slides.length; i < len; i++) {
      //     if (slides[i].id == slide_hash) {
      //       currentSlideNo = i;
      //       updateSlideClasses(); 
      //     }
      //   }
      // }

	  /**
		绑定Ctrl+点击，切换到相应PPT的事件
	  */
	  function clickOnSelect (e) {
		if(e.ctrlKey) {
			//console.log(e);
			var slide = $(e.target).closest('.slide');
			//console.log(slide);
			var index = $(slide).data('slide-index');
			//console.log(index);
			switchToSide(index);
			e.preventDefault();	//别点到链接了
		} else {
			//忽略
		}
	  }
	  /**
		绑定目录的跳转
	  */
		function clickOnJump (e) {
			var el = e.target;
			if(el.tagName.toLowerCase() == 'a' && (el.href.indexOf('#ppt-') > -1)) {
				var id = el.href.slice(el.href.indexOf('#ppt-'));
				//console.log(id);
				switchToId(id.replace('#',''));
				e.preventDefault();
			}
		}
	  /*<*/
	  var currentSlideId = '';
	  var currentSlideIndex = 1;
      function indexToId (i) {
		  return slideIndexList[i];
      }
	  function idToIndex (id) {
		  return baidu.array.indexOf(slideIndexList, id);
	  }
	  function getLocationId () {
		return window.location.hash.replace('#!/', '');
	  }
	  function setLocationId (id) {
		window.location.hash = '!/'+id;
	  }
      function initialize() {
		 ///构建PPT队列
        var els = slides;
        for (var i = 0, el; el = els[i]; i++) {
			//建立id/dom的
			var id = el.id || 'slide'+(i+1);	
			slideIndexList.push(id) ;
			slideList[id] = el;
			//console.log(slideIndexList.length-1+":"+id);
			baidu.dom.addClass(el, 'far-future');
			$(el).data('slide-index', 1+i);
			//console.log('hello:'+ $(el).data('slide-index'));
          //el.className = 'slide far-future';
        }      
		
		if (currentSlideId = getLocationId() ) {
			//currentSlideId = window.location.hash.replace('#', '');
			currentSlideIndex = Math.max(idToIndex(currentSlideId),1);

			//currentSlideNo = Number(window.location.hash.replace('#slide', ''));
        } else {
			currentSlideIndex = 1;
			currentSlideId = indexToId(currentSlideIndex);
		
			//currentSlideNo = 1;
        }
	  /*>*/

		configKeyboradControl();
		configMouseControl();
		//baidu.event.on(document, 'keydown', handleBodyKeyDown, false);
		//$(document).delegate('.slide','click', clickOnSelect);
		$(document).delegate('a[href*=#ppt-]','click', clickOnJump);
		//$(document).delegate('[slide-index]','hover', clickOnSelect);



        updateSlideClasses(); 
      }
      
      function getSlideEl(slideNo) {
        if (slideNo > 0) {
			return slideList[indexToId(slideNo)];

			//return slides[slideNo - 1];
        } else {
          return null;
        }
      }
      
      function getSlideTitle(slideNo) {
        var el = getSlideEl(slideNo);
        
        if (el) {
          return el.getElementsByTagName('hgroup')[0].innerHTML;
        } else {
          return null;
        }
      }
      
      function changeSlideElClass(slideNo, className) {
        var el = getSlideEl(slideNo);
        
        if (el) {
		  baidu.dom.removeClass(el, 'far-past past current future far-future');
		  baidu.dom.addClass(el, className);
          //el.className = 'slide ' + className;
        }
      }
      function resetSlideClasses() {
        for (var i = 1, el; idx = slideIndexList[i], el=slideList[idx]; i++) {
			baidu.dom.addClass(el, 'far-future');
			baidu.dom.removeClass(el, 'far-past past current future far-future');
			//console.log('hello:'+ $(el).data('slide-index'));
          //el.className = 'slide far-future';
        }
	  }
      function updateSlideClasses() {
        //window.location.hash = "slide" + currentSlideNo;
		setLocationId(slideIndexList[currentSlideIndex]);
		/**
        changeSlideElClass(currentSlideNo - 2, 'far-past');
        changeSlideElClass(currentSlideNo - 1, 'past');
        changeSlideElClass(currentSlideNo, 'current');
        changeSlideElClass(currentSlideNo + 1, 'future');
        changeSlideElClass(currentSlideNo + 2, 'far-future');  
		**/
        changeSlideElClass(currentSlideIndex - 2, 'far-past');
        changeSlideElClass(currentSlideIndex - 1, 'past');
        changeSlideElClass(currentSlideIndex, 'current');
        changeSlideElClass(currentSlideIndex + 1, 'future');
        changeSlideElClass(currentSlideIndex + 2, 'far-future'); 
      }
      function  switchToHome() {
		switchToSide(1);
      }
      function  switchToEnd() {
		//switchToSide(slides.length);
		switchToSide(slideIndexList.length-1);
      }
	  function switchToId(id){
		switchToSide(idToIndex(id));
	  }
      function switchToSide(num) {
		resetSlideClasses();
        if (num > 0 && num <= slides.length) {
          //currentSlideNo = num;
		  currentSlideIndex = num;
        }
        
        updateSlideClasses();
      }

      function nextSlide() {
		 /*
        if (currentSlideNo < slides.length) {
          currentSlideNo++;
        }*/
		if (currentSlideIndex < slideIndexList.length-1) {
			currentSlideIndex++;
		}
        updateSlideClasses();
      }
      
      function prevSlide() {
		 /*
        if (currentSlideNo > 1) {
          currentSlideNo--;
        }*/
		if (currentSlideIndex > 1) {
			currentSlideIndex--;
		}
        updateSlideClasses();
      }
	  function toggleMini() {
		  baidu.dom.toggleClass(document.body, 'outline');
		  //document.body.id =document.body.id=='outline'?'all':'outline';
	  }
	  /*
		keyCode: 36
		keyIdentifier: "Home"

		keyCode: 35
		keyIdentifier: "End"
	  */

	  //@see https://github.com/madrobby/keymaster
		function configKeyboradControl () {
			//向前
			key('pagedown, down, right, space', nextSlide);
			//返回
			key('pageup, up, left', prevSlide);
			//回首页
			key('home', switchToHome);
			//到末页
			key('end', switchToEnd);
			//切换鸟瞰视图
			key('shift+3', toggleMini);
		}
		function configMouseControl () {
			//$(document).delegate('.slide','click', clickOnSelect);
			mouse.on('click', 'left', clickOnSelect);	//: add callback as listener for each type in types
			//mouse.off(types, [buttons], callback): remove callback from listeners for each type in types
		}
		/*
      function handleBodyKeyDown(event) {

        switch (event.keyCode) {
		case 33:	//pageUp
        case 37: // left arrow
            prevSlide();
            break;
		  case 32:	//Space
		  case 34:	//pageDown
          case 39: // right arrow
          // case 32: // space
            nextSlide();
            break;
          case 50: // 2
            showNotes();          
            break;
		  case 35:	//End
			event.ctrlKey && switchToEnd();
			break;
		  case 36:	//Home
			event.ctrlKey && switchToHome();
			break;
		 case 121:	//F10
		  	document.body.id =document.body.id=='outline'?'all':'outline';
		  	break;
		  case 122: //F11
			break;
        }
      }*/
            
      initialize();