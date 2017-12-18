const SUPERCLM_EXIT_PRESENTATION = 'SuperCLM_Exit_Presentation';


function removeExitBar() {
    let exitBar = document.getElementsByClassName('SuperCLM__exit-bar');
    if(exitBar.length > 0) {
        document.body.removeChild(exitBar[0]);
    }
}

function slideInBackButton() {
    if(document.getElementsByClassName('SuperCLM__exit-bar').length > 0) {
        return;
    }
    document.body.innerHTML +=
        '<div class="SuperCLM__exit-bar">' +
            '<a class="SuperCLM__exit-bar__close-presentation" href="javascript:void">Close Presentation<a>' +
            '<a class="SuperCLM__exit-bar__close-bar" href="javascript:void">X<a>' +
        '</div>';
    document.getElementsByClassName('SuperCLM__exit-bar__close-presentation')[0]
        .addEventListener('click', () => postMessage(SUPERCLM_EXIT_PRESENTATION));
    document.getElementsByClassName('SuperCLM__exit-bar__close-bar')[0]
        .addEventListener('click', () => removeExitBar());
}

(function ready() {
    let lastTouch = null;
    document.addEventListener('click', function(e) {
        if (lastTouch != null && e.timeStamp - lastTouch <= 500) {
            slideInBackButton();
        }
        lastTouch = e.timeStamp;
    });
})();