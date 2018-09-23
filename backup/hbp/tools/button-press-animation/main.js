(function () {
    var state = "playing";
    var EVENTS = "webkitAnimationEnd animationend oanimationend";
    var BUTTON_ANIMATION_CLASSES = "pressed_down_state animation_release_up_state animation_press_down_state animation_press animation_fill_mode_forwards";
    var RIPPLE_ANIMATION_CLASSES = "animation_first_half_ripple animation_second_half_ripple animation_ripple animation_fill_mode_forwards";
    var playPauseBtnElem = document.getElementById("play-pause-btn");
    var stopBtnElem = document.getElementById("stop-btn");
    var animatingElem = document.getElementById("animating");
    var slideInBtnElem = document.getElementById("slide-in-btn");
    var slideOutBtnElem = document.getElementById("slide-out-btn");
    var pressDownBtnElem = document.getElementById("press-btn");
    var pressedBtnElem = document.getElementById("pressed-btn");
    var releaseUpBtnElem = document.getElementById("release-btn");
    var opacWrapperElem = document.getElementById("animating_opac_wrapper");
    var rippleElem = document.getElementById("button_ripple");

    var removeAnimationCls = function removeAnimationCls() {
        BUTTON_ANIMATION_CLASSES.split(" ").forEach(function (value) {
            animatingElem.classList.remove(value);
        });
        RIPPLE_ANIMATION_CLASSES.split(" ").forEach(function (value) {
            rippleElem.classList.remove(value);
        });
    };

    var renderPauseAnimation = function () {
        removeAnimationCls();
        animatingElem.classList.add("animation_pause");
        rippleElem.classList.add("animation_pause");
        playPauseBtnElem.innerText = "PLAY";
    };

    var renderPlayAnimation = function () {
        removeAnimationCls();
        animatingElem.classList.remove("animation_pause");
        animatingElem.classList.add("animation_press");
        rippleElem.classList.remove("animation_pause");
        rippleElem.classList.add("animation_ripple");
        playPauseBtnElem.innerText = "PAUSE";
    };

    var renderStopAnimation = function () {
        removeAnimationCls();
        playPauseBtnElem.innerText = "PLAY";
        state = "paused";
    };

    var toggleState = function (ev) {
        if (state === "playing") {
            renderPauseAnimation();
            state = "paused";
        } else if (state === "paused") {
            renderPlayAnimation();
            state = "playing";
        }
    };

    var onTransitionEnd = function (e) {
        if (e.animationName === "press") {
            renderStopAnimation();
        }
    };

    var onSlideInAnimationEnd = function (e) {
        if (e.animationName === "slideInRight") {
            console.info("slideIn done");
            EVENTS.split(" ").forEach(function (value, index, array) {
                opacWrapperElem.removeEventListener(value, onSlideInAnimationEnd, false);
            });
        }
    };

    var onSlideOutAnimationEnd = function (e) {
        if (e.animationName === "slideOutRight") {
            console.info("slideOut done");
            EVENTS.split(" ").forEach(function (value, index, array) {
                opacWrapperElem.removeEventListener(value, onSlideOutAnimationEnd, false);
            });
        }
    };

    var slideIn = function () {
        opacWrapperElem.classList.remove("button_slideOutRight");
        opacWrapperElem.classList.remove("button_animated_forwards");
        opacWrapperElem.classList.add("button_slideInRight");
        opacWrapperElem.classList.add("button_animated_forwards");
        EVENTS.split(" ").forEach(function (value, index, array) {
            opacWrapperElem.addEventListener(value, onSlideInAnimationEnd, false);
        });
    };

    var slideOut = function () {
        opacWrapperElem.classList.remove("button_slideInRight");
        opacWrapperElem.classList.remove("button_animated_forwards");
        opacWrapperElem.classList.add("button_slideOutRight");
        opacWrapperElem.classList.add("button_animated_forwards");
        EVENTS.split(" ").forEach(function (value, index, array) {
            opacWrapperElem.addEventListener(value, onSlideOutAnimationEnd, false);
        });
    };

    var pressOnlyAnimation = function pressOnlyAnimation() {
        removeAnimationCls();
        animatingElem.classList.add("animation_press_down_state");
        animatingElem.classList.add("animation_fill_mode_forwards");
        rippleElem.classList.add("animation_first_half_ripple");
        rippleElem.classList.add("animation_fill_mode_forwards");
        EVENTS.split(" ").forEach(function (value, index, array) {
            opacWrapperElem.addEventListener(value, onPressOnlyAnimationEnd, false);
        });
    }

    var pressedAnimation = function pressedAnimation() {
        removeAnimationCls();
        animatingElem.classList.add("pressed_down_state");
    };

    var onPressOnlyAnimationEnd = function onPressOnlyAnimationEnd(e) {
        if (e.animationName === "pressDownState") {
            console.info("pressDownState done");
            EVENTS.split(" ").forEach(function (value, index, array) {
                opacWrapperElem.removeEventListener(value, onPressOnlyAnimationEnd, false);
            });
        }
    };

    var releaseOnlyAnimation = function releaseOnlyAnimation() {
        removeAnimationCls();
        animatingElem.classList.add("animation_release_up_state");
        animatingElem.classList.add("animation_fill_mode_forwards");
        rippleElem.classList.add("animation_second_half_ripple");
        rippleElem.classList.add("animation_fill_mode_forwards");
        EVENTS.split(" ").forEach(function (value, index, array) {
            opacWrapperElem.addEventListener(value, onReleaseOnlyAnimationEnd, false);
        });
    }

    var onReleaseOnlyAnimationEnd = function onReleaseOnlyAnimationEnd(e) {
        if (e.animationName === "releaseUpState") {
            console.info("releaseUpState done");
            EVENTS.split(" ").forEach(function (value, index, array) {
                opacWrapperElem.removeEventListener(value, onReleaseOnlyAnimationEnd, false);
            });
        }
    };

    EVENTS.split(" ").forEach(function (value, index, array) {
        animatingElem.addEventListener(value, onTransitionEnd, false);
    });

    playPauseBtnElem.addEventListener("click", toggleState, false);
    stopBtnElem.addEventListener("click", renderStopAnimation, false);
    slideInBtnElem.addEventListener("click", slideIn, false);
    slideOutBtnElem.addEventListener("click", slideOut, false);
    pressDownBtnElem.addEventListener("click", pressOnlyAnimation, false);
    pressedBtnElem.addEventListener("click", pressedAnimation, false);
    releaseUpBtnElem.addEventListener("click", releaseOnlyAnimation, false);
})();