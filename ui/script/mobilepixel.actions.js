/**
 * Created by Jim Ankrom on 6/20/2015.
 */

// Plug in more actions
(function () {
    var actions = pixel.actions;

    // morph from existing color to the next
    actions.tween = function (params) {

        var tween = new TWEEN.Tween().to(params, params.interval);
        //createjs.Tween.get(elements.body.style).to(params, params.interval, "linear").call(handleComplete);

        tween.onUpdate(function(){
            elements.body.style = position.x;
            mesh.position.y = position.y;
        });
        tween.easing(TWEEN.Easing.Quintic.In);
        tween.start();
        tween.update();
    };
})();