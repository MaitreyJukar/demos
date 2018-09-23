(function($)
{
     var self;
     var mediaState;
     var nCurrentTime;
     var bPaused = function() {
          return self[0].paused;
     };
     
     $.fn.videoPlayer = function(method) {
          if ( methods[method] ) {
               return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
          } else if ( typeof method === 'object' || ! method ) {
               return methods.init.apply( this, arguments );
          } else {
               $.error( 'Method ' +  method + ' does not exist on videoplayer' );
          } 
          
     }
     
     var togglePlay = function() {
          if (bPaused())
          {
               this.play();
          }
          else
          {
               this.pause();
          }
     }
     
     var initPlayer = function() {
          self = this;
          nCurrentTime = 0;
          if(navigator.userAgent.toLowerCase().indexOf("firefox") != -1)
          {
            setTimeout(function()
            {
                self.attr('controls','controls');    
            }, 0)    
          }
          else
          {
              self.attr('controls','controls');
          }
          bindHandlers();
          //self[0].play();
          var oMediaState = $('<div />', {
            'class': 'media-state'
          });
          self.after(oMediaState);
          mediaState = $('.media-state');
          var nMaxHeight = self.height() - self.height() / 2.5;
          var nThrobberLeft = self.width()/2 - 10;
          var nThrobberTop = self.height()/2 -10;
          var nZIndex = parseInt(self.css("z-index")) + 1;
          if(isNaN(nZIndex))
          {
              nZIndex = undefined;
          }
          mediaState.css({
               left: self.position().left,
               top: self.position().top,
               width: self.width(),
               height: nMaxHeight,
               backgroundPosition: nThrobberLeft+"px " + nThrobberTop+"px",
               zIndex: nZIndex               
          });
          if ($.browser.mozilla)
          {
               mediaState.css({
                    backgroundImage: 'none'
               })
          }
          else
          {
            var strThrobberCss = "<style type=\"text/css\">\n";
            strThrobberCss += ".media-state.waiting {";
            strThrobberCss += "background-image: url('" + CPreloadingManager.GetImagePath('Throbber') + "');";
            strThrobberCss += "}\n";
            strThrobberCss += ".media-state.ended {";
            strThrobberCss += "background-image: none";
            strThrobberCss += "}";
            strThrobberCss += "\n</style>"
            $('head').append(strThrobberCss);
        }
    }
     
     var bindHandlers = function() {
          self.bind({
               loadstart: function() {
                    
              },
              suspend: function() {
                    
              },
              abort: function() {
                    
              },
              error: function() {
                    
              },
              stalled: function() {
                    
                    mediaState.addClass('waiting');
              },
              loadedmetadata: function() {
                    
              },
              loadeddata: function(e) {
                  
              },
              canplay: function() {
                  mediaState.removeClass('waiting');     
              },
              canplaythrough: function() {
                  
              },
              progress: function(event) {
                    // progress event
              },
              playing: function() {
                  mediaState.removeClass('waiting'); 
                  mediaState.removeClass('ended');
              },
              waiting: function() {
                  mediaState.addClass('waiting');
              },
              seeking: function() {
                  mediaState.addClass('waiting');
                  nCurrentTime = self[0].currentTime;
              },
              seeked: function() {
                  mediaState.removeClass('waiting');
              },
              ended: function() {
                  mediaState.removeClass('waiting');
				  mediaState.addClass('ended');
              },
              durationchange: function() {                  
              },
              ratechange: function() {
                  
              },
              volumechange: function() {
                  
              },
              pause: function() {
                  
              },
              timeupdate: function(){
                  
                  if (!self[0].seeking)
                  {
                        mediaState.removeClass('waiting');
                  }
              }
          });
     }
     
     var methods = {
          toggle: togglePlay, 
          init: initPlayer,
          bind: bindHandlers
     }
})(jQuery);