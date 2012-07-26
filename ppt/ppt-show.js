		/**
		@see http://www.html5rocks.com/
		*/

      var currentSlideNo;
      var notesOn = false;
      var slides = baidu.dom.query('.slide');
      var touchStartX = 0;

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
			console.log(e);
			var slide = $(e.target).closest('.slide');
			console.log(slide);
			var index = $(slide).data('slide-index');
			console.log(index);
			switchToSide(index);
			e.preventDefault();	//别点到链接了
		} else {
			//忽略
		}
	  }
      
      function initialize() {
        if (window.location.hash != "") {
          currentSlideNo = Number(window.location.hash.replace('#slide', ''));
        } else {
          currentSlideNo = 1;
        }

        //document.addEventListener('keydown', handleBodyKeyDown, false);
		baidu.event.on(document, 'keydown', handleBodyKeyDown, false);
		$(document).delegate('.slide','click', clickOnSelect);
		//$(document).delegate('[slide-index]','hover', clickOnSelect);


        var els = slides;
        for (var i = 0, el; el = els[i]; i++) {
			baidu.dom.addClass(el, 'far-future');
			$(el).data('slide-index', 1+i);
			//console.log('hello:'+ $(el).data('slide-index'));
          //el.className = 'slide far-future';
        }
        updateSlideClasses(); 
      }
      
      function getSlideEl(slideNo) {
        if (slideNo > 0) {
          return slides[slideNo - 1];
        } else {
          return null;
        }
      }
      
      function getSlideTitle(slideNo) {
        var el = getSlideEl(slideNo);
        
        if (el) {
          return el.getElementsByTagName('header')[0].innerHTML;
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
        var els = slides;
        for (var i = 0, el; el = els[i]; i++) {
			baidu.dom.addClass(el, 'far-future');
			baidu.dom.removeClass(el, 'far-past past current future far-future');
			//console.log('hello:'+ $(el).data('slide-index'));
          //el.className = 'slide far-future';
        }
	  }
      function updateSlideClasses() {
        window.location.hash = "slide" + currentSlideNo;
        changeSlideElClass(currentSlideNo - 2, 'far-past');
        changeSlideElClass(currentSlideNo - 1, 'past');
        changeSlideElClass(currentSlideNo, 'current');
        changeSlideElClass(currentSlideNo + 1, 'future');
        changeSlideElClass(currentSlideNo + 2, 'far-future');                
      }
      function  switchToHome() {
		switchToSide(1);
      }
      function  switchToEnd() {
		switchToSide(slides.length);
      }
      function switchToSide(num) {
		resetSlideClasses();
        if (num > 0 && num <= slides.length) {
          currentSlideNo = num;
        }
        
        updateSlideClasses();
      }

      function nextSlide() {
        if (currentSlideNo < slides.length) {
          currentSlideNo++;
        }
        
        updateSlideClasses();
      }
      
      function prevSlide() {
        if (currentSlideNo > 1) {
          currentSlideNo--;
        }
        updateSlideClasses();
      }
      
      function switch3D() {
        if (document.body.className.indexOf('three-d') == -1) {
          document.getElementsByClassName('presentation')[0].style.webkitPerspective = '1000px';

          document.body.className += ' three-d';
        } else {
          window.setTimeout("document.getElementsByClassName('presentation')[0].style.webkitPerspective = '0';", 2000);
          document.body.className = document.body.className.replace(/three-d/, '');
        }
      }
      
      function showNotes() {
        var notes = document.querySelectorAll('.notes');
        for (var i = 0, len = notes.length; i < len; i++) {
          notes[i].style.display = (notesOn) ? 'none':'block';
        }
        notesOn = (notesOn) ? false:true;
      }
      
	  /*
		keyCode: 36
		keyIdentifier: "Home"

		keyCode: 35
		keyIdentifier: "End"
	  */
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
        }
      }
            
      initialize();