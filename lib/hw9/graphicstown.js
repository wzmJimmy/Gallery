var isValidGraphicsObject = function (object) {
    if(typeof object.draw !== "function" && typeof object.drawAfter !== "function") {
        console.log("warning: GraphicsObject of type " + object.name + " does not contain either a draw or drawAfter method");
        return false;
    }
    if(typeof object.init !== "function") {
        console.log("warning: GraphicsObject of type " + object.name + " does not contain an init method. ");
        return false;
    }

    return true;
}

window.onload = function() {
    "use strict";

    var toExamine = document.createElement("select");
    for(var name in grobjects){toExamine.innerHTML +=  "<option>" + name + "</option>";}
    $("object_list").appendChild(toExamine);

    var uiMode = $("view_mode");
    var checkboxes = {"Run":$("Run"),"Examine":$("Examine")};
    var sliders = {"TimeOfDay":$("daylight")};

    // information for the cameras
    var lookAt = [0,0,0];
    var lookFrom = [0,4,-10];
    var fov = 0.8;

    var lightTo = [0,0,0];
    var lightFrom = [0,8,0];
    var the = 2.3;

    // for timing
    var realtime = 0
    var lastTime = Date.now();

    // cheesy keyboard handling
    var keysdown = {};

    window.onkeydown = function(e) {
        var event = window.event ? window.event : e;
        keysdown[event.keyCode] = true;
        e.stopPropagation();
    };
    window.onkeyup = function(e) {
        var event = window.event ? window.event : e;
        delete keysdown[event.keyCode];
        e.stopPropagation();
    };



    var lastS = true;
    var count = 0;

    // the actual draw function - which is the main "loop"
    function draw() {
        count++;
        // advance the clock appropriately (unless its stopped)
        var curTime = Date.now();
        if (checkboxes.Run.checked) {
            realtime += (curTime - lastTime);
        }
        lastTime = curTime;

        // first, let's clear the screen
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // figure out the transforms
        var projM = m4.perspective(fov, 1.2, 0.1, 150);
        var cameraM = m4.lookAt(lookFrom,lookAt,[0,1,0]);
        var viewM = m4.inverse(cameraM);

        // implement the camera UI
        if (uiMode.value == "ArcBall") {
            viewM = arcball.getMatrix();
            //viewM = m4.multiply(viewM,m4.translation([0, 0, -10]));
            m4.setTranslation(viewM, [0, 0, -10], viewM);
        } else if (uiMode.value == "Drive") {/**wsad**/
            if (keysdown[65]) { driveTheta += .02; } /*a?d?*/
            if (keysdown[68]) { driveTheta -= .02; } /*a?d?*/
            if (keysdown[87]) {
                var dz = Math.cos(driveTheta);
                var dx = Math.sin(driveTheta);
                drivePos[0] -= .05*dx;
                drivePos[2] -= .05*dz;
            }
            if (keysdown[83]) {
                var dz = Math.cos(driveTheta);
                var dx = Math.sin(driveTheta);
                drivePos[0] += .05*dx;
                drivePos[2] += .05*dz;
            }

            cameraM = m4.rotationY(driveTheta);  /*???*/
            m4.setTranslation(cameraM, drivePos, cameraM);
            viewM = m4.inverse(cameraM);
        }else if (uiMode.value == "Fly") {

            if (keysdown[65] || keysdown[37]) { 
                driveTheta += .02; 
            }else if (keysdown[68] || keysdown[39]) { 
                driveTheta -= .02; 
            }

            if (keysdown[38]) { driveXTheta += .02; }
            if (keysdown[40]) { driveXTheta -= .02; }

            var dz = Math.cos(driveTheta);
            var dx = Math.sin(driveTheta);
            var dy = Math.sin(driveXTheta);

            if (keysdown[87]) {
                drivePos[0] -= .25*dx;
                drivePos[2] -= .25*dz;
                drivePos[1] += .25 * dy;
            }

            if (keysdown[83]) {
                drivePos[0] += .25*dx;
                drivePos[2] += .25*dz;
                drivePos[1] -= .25 * dy;
            }

            cameraM = m4.rotationX(driveXTheta); /*???*/
            m4.multiply(cameraM, m4.rotationY(driveTheta), cameraM);
            m4.setTranslation(cameraM, drivePos, cameraM);
            viewM = m4.inverse(cameraM);
        }

        // get lighting information         /*fix*/
        var tod = Number(sliders.TimeOfDay.value);
        var sunAngle = Math.PI * (tod-6)/12;
        var sunDirection = [Math.cos(sunAngle),Math.sin(sunAngle),0];

        var theta = Number(realtime)/1000.0;
        var r = 3;
        lightTo = [r*Math.cos(theta),0,r*Math.sin(theta)];
        var lprojM = m4.perspective(the, 1, 0.1,20);
        var lcameraM = m4.lookAt(lightFrom,lightTo,[0,0,-1]);
        var lviewM = m4.inverse(lcameraM);
        // make a real drawing state for drawing
        drawingState = {
            proj : projM,   // m4.identity(),
            view : viewM,   // m4.identity(),
            timeOfDay : tod,
            sunDirection : sunDirection,
            realtime : realtime,
            lproj : lprojM,
            lview : lviewM,
        }

        // initialize all of the objects that haven't yet been initialized (that way objects can be added at any point)
        for(var name in grobjects){
            var obj = grobjects[name];
            if(!obj.__initialized) {
                if(isValidGraphicsObject(obj)){
                    obj.init();
                    obj.__initialized = true;
                }
            }
        }

        if(!reflaction.__initialized) {
            reflaction.init();
            reflaction.__initialized = true;
        }

        //console.log(grobjects);

        // now draw all of the objects - unless we're in examine mode
        if (checkboxes.Examine.checked) {
            var examined = grobjects[toExamine.value];
            examined.setflag(false);
            examined.draw();

            lastS = false;

        } else {

            reflaction.draw_1();

            drawingState.proj = projM;
            drawingState.view = viewM;
            for(var obj in grobjects){
                grobjects[obj].draw();
                if(!lastS) grobjects[obj].setflag(true);
            }

            reflaction.draw_2();

            if(!lastS) lastS = true;
        }
        window.requestAnimationFrame(draw);
        //if(count<=40) window.requestAnimationFrame(draw);
    };
    draw();
};
