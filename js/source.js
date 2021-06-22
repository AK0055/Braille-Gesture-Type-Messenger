document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}

 function Dot(id, o){

    var self = this;

    this._id = id;
    this._x = o.x;
    this._y = o.y;
    
    
    this._dotInnerLayer = o.innerLayer;
    this._listenerLayer = o.listenerLayer;
    
   
    this._pattern = o.pattern;
    
   
    this._innerCircleRadius = 5;
    this._innerCircleFill = "rgba(255,255,255,0)";
    this._innerCircleStroke = "#aaa";
    
   
    this._strokeWidth = 4;
    
    var stage = this._dotInnerLayer.getStage();
    var minDotRadius = Math.min(
        stage.getWidth(), 
        stage.getHeight()
        );
    
   
    this._outerCircleConfig = {
        radius : minDotRadius/10,
        fill : "rgba(255,255,255,0)",
        stroke : "lime",
        strokeWidth : self.strokeWidth,
    };

   
    this._innerCircle = new Kinetic.Circle({
        x:              self._x,
        y:              self._y,
        radius:         self._innerCircleRadius,
        fill:           self._innerCircleFill,
        stroke:         self._innerCircleStroke,
        strokeWidth:    self.strokeWidth
    });
     
   
     this._listenerCircle = new Kinetic.Circle({
        x:              self._x,
        y:              self._y,
        radius:         self._outerCircleConfig.radius,
        fill:           'transparent',
        listening:      true 
     });
     
   

     this._listenerCircle.on("mousedown mousemove touchmove", this._showUserDot.bind(this));
     this._listenerCircle.on("mouseout", this._mouseout.bind(this));
     this._listenerCircle.on("mouseup touchend", this._isValid.bind(this));
     this._dotInnerLayer.add(this._innerCircle);
     this._listenerLayer.add(this._listenerCircle);
     this._dotInnerLayer.draw();
     this._listenerLayer.draw();

 }


 Dot.prototype.getX = function(){
    return this._x;
 };


 Dot.prototype.getY = function(){
    return this._y;
 };


 Dot.prototype._isValid = function(){
    if( this._pattern.isRecording ){
        return;
    }

    var event = (function createEvent(){
        var event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("click", true, true);
        } else {
            event = document.createEventObject();
            event.eventType = "click";
        }
        return event;
    })();

    var btn = document.getElementById('unlock-button');
    if( btn.dispatchEvent ){
        btn.dispatchEvent(event);
    }
    else if( btn.fireEvent ){
        btn.fireEvent('on'+event.eventTye, event);
    }
 };


 Dot.prototype._showUserDot = function(e) {

    document.body.style.cursor = 'pointer';

    // hide the inner circle
    this._innerCircle.setStrokeWidth(2);
    this._dotInnerLayer.draw();
    
    // add an outer circle if needed
    var self = this;
    var outerCircle = new Kinetic.Circle({
        x:              self._innerCircle.getX(),
        y:              self._innerCircle.getY(),
        radius:         0,
        fill:           self._outerCircleConfig.fill,
        stroke:         self._outerCircleConfig.stroke,
        strokeWidth:    self._outerCircleConfig.strokeWidth
    });
    this._pattern.addDot(outerCircle, this._outerCircleConfig);
    
 };


 Dot.prototype._mouseover = function() {
    document.body.style.cursor = 'pointer';
 };


 Dot.prototype._mouseout = function() {
    document.body.style.cursor = 'default';
 };


 Dot.prototype.clear = function(){
    this._innerCircle.setFill(this._innerCircleFill);
    this._innerCircle.setRadius(this._innerCircleRadius);
    this._dotInnerLayer.draw();
 };;/*
 * The Pattern class.
 * @constructor
 * @private
 */
function Pattern(o){

   
    this._userDots = [];
    
   
    this._savedPattern = [];
    this._alpha= ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    this._num= ['1','2','3','4','5','6','7','8','9','0'];
    this._saved=[[1],[1,3],[1,2],[1,2,4],[1,4],[1,2,3],[1,2,3,4],[1,3,4],[2,3],[2,3,4],[1,5],[1,3,5],[1,2,5],[1,2,4,5]
    ,[1,4,5],[1,2,3,5],[1,2,3,4,5],[1,3,4,5],[2,3,5],[2,3,4,5],[1,5,6],[1,3,5,6],[2,3,4,6],[1,2,5,6],[1,2,4,5,6],[1,4,5,6]];
    this._xy=[[67,67],[200,67],[67,200],[200,200],[67,333],[200,333]];
    this._saved1=[[1],[1,3],[1,2],[1,2,4],[1,4],[1,2,3],[1,2,3,4],[1,3,4],[2,3],[2,3,4]];
    var stage = o.patternLayer.getStage();
    var mousePos = stage.getMousePosition() || {x: stage.getWidth()/2, y: stage.getHeight()/2};
    
   
    this._x0 = mousePos.x;
    this._y0 = mousePos.y;
    
   
    this._x = this._x0 ;
    this._y = this._y0;
    
    
    this._patternLayer = o.patternLayer;
    this._lineLayer = o.lineLayer;
    this._hintLayer = o.hintLayer;
    
   
    this._isRecording = false;
    
   
    this._toBeClearedOnNextUse = false;
}


Pattern.prototype.setRecording = function(state){
    this._isRecording = state;
};


Pattern.prototype.setToBeClearedOnNextUse = function(state){
    this._toBeClearedOnNextUse = state;
};


Pattern.prototype.showHint = function(){
    this._hintLayer.show();
    this._hintLayer.draw();
};


Pattern.prototype.hideHint = function(){
    this._hintLayer.hide();
    this._hintLayer.draw();
};


Pattern.prototype.buildHint = function(){
    this._lineLayer.removeChildren();
    var line = this._newLine(this._savedPattern);
    this._hintLayer.add(line);
};


Pattern.prototype.addDot = function(dot, config){
    if( this._toBeClearedOnNextUse ){
        this.clear();
        this._toBeClearedOnNextUse = false;
    }

    if( this.shouldDrawDot(dot) ){

        if( this._isRecording ){
            this.savePatternDot(dot);
        }
        else {
            if( this.shouldDrawDot(dot) ){
                this.addUserDot(dot);               
            }
        }
    
        this._patternLayer.add(dot);
        this.setTransition(dot, config);
        this._patternLayer.draw();      
    }

};


Pattern.prototype.shouldDrawDot = function(dot){
    var dots = this._isRecording ? this._savedPattern : this._userDots;
    for(var i=0; i<dots.length; i+=1){
        var o = dots[i];
        if( o.getX() === dot.getX() && o.getY() === dot.getY() ){
            return false;
        }
    }
    return true;
};


Pattern.prototype.setTransition = function(dot, config){
    var self = this;
    var tween = new Kinetic.Tween({
        node: dot,
        radius: config.radius,
        duration: 0.1,
        onFinish: self.drawLine()
    });
    tween.play();
    
};


Pattern.prototype.addUserDot = function(dot){       
    this._userDots.push(dot);
};


Pattern.prototype.drawLine = function(){
    var line;
    var dots = this._isRecording ? this._savedPattern : this._userDots;
    var l = dots.length;
    if( l >= 2 ){
        line = this._newLine(dots);
        this._lineLayer.removeChildren();
        this._lineLayer.add(line);
        this._lineLayer.draw();
    }
};


Pattern.prototype._newLine = function(dots){
    return new Kinetic.Shape({
        drawFunc: function() {
            var ctx = this.getContext();
            var dot1 = dots[0];
            var dot;
            ctx.beginPath();
            ctx.moveTo(dot1.getX(), dot1.getY());
            for(var i=1; i<dots.length; i+=1){
                dot = dots[i];
                ctx.lineTo(dot.getX(), dot.getY());             
            }
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
        },
        stroke: "rgba(255,255,255,0.5)",
        strokeWidth: 5
    });
};


msg=[];var current="";
msg1=[];var current1="";
count=0;
Pattern.prototype.isValid = function(){
    if(count==0){
    var j,c=0,a=0;
    for(j=0;j<26;j++){
        c=0;
    if( this._saved[j].length == this._userDots.length ){
        for(var i=0;i<this._userDots.length;i++){
            
            var x=[],y=[],t=this._saved[j][i];
            x[i]=this._xy[t-1][0];
            y[i]=this._xy[t-1][1];
            if((x[i]==this._userDots[i].getX())&&( y[i]==this._userDots[i].getY())){
                c++;

            }
            
        }
        if(c!=this._saved[j].length){
            continue;

    }
    else{
    console.log(this._alpha[j]);
    current=String(this._alpha[j]);
    var res="";
    res=res.concat(current);
    msg.push(this._alpha[j]); 
    q=String(msg);   
    console.log(res);
    document.getElementById("out").innerText = msg.join('');
    a++;
    console.log(msg);
    

    break;}
    }}}
    else if(count==1){
        var j,c=0,a=0;
    for(j=0;j<10;j++){
        c=0;
    if( this._saved1[j].length == this._userDots.length ){
        for(var i=0;i<this._userDots.length;i++){
            
            var x=[],y=[],t=this._saved1[j][i];
            x[i]=this._xy[t-1][0];
            y[i]=this._xy[t-1][1];
            if((x[i]==this._userDots[i].getX())&&( y[i]==this._userDots[i].getY())){
                c++;

            }
            
        }
        if(c!=this._saved1[j].length){
            continue;

    }
    else{
    console.log(this._num[j]);
    current1=String(this._num[j]);
    var res1="";
    res1=res1.concat(current1);
    msg1.push(this._num[j]); 
    q=String(msg1);   
    console.log(res1);
    document.getElementById("out").innerText = msg1.join('');
    a++;
    console.log(msg1);
    

    break;}

    }
    
    }
 
    
}
else if(count==2){
    /*
    var http = require('http');
var urlencode = require('urlencode');
var mes = urlencode(msg);
var toNumber = '9677053452';
var username = 'grrreat0055@gmail.com';
var hash = '03666166d27daf99b6f443b60bcf80da81c97435acbc186707e6c1efd3b7ed1f'; // The hash key could be found under Help->All Documentation->Your hash key. Alternatively you can use your Textlocal password in plain text.
var sender = 'AK';
var data = 'username=' + username + '&hash=' + hash + '&sender=' + sender + '&numbers=' + toNumber + '&message=' + mes;
var options = {
  host: 'api.textlocal.in', path: '/send?' + data
};
callback = function (response) {
  var str = '';//another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });//the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
  });
}//console.log('hello js'))
http.request(options, callback).end();//url encode instalation need to use $ npm install urlencode*/
const axios = require("axios");
//const smsClient = require("./smsClient"); //Modify the path based on your app
const user = {name: "Didiyo", phone: "9677053452"};
smsClient.sendPartnerWelcomeMessage(user);
const tlClient = axios.create({
  baseURL: "https://api.textlocal.in/",
  params: {
    apiKey: "MmUzOThiNzhlZDViYWFkOTA2NjU0ZmM1N2FlODIwNGE", //Text local api key
    sender: "AK0055"
  }
});

const smsClient = {
  sendPartnerWelcomeMessage: user => {
    if (user && user.phone && user.name) {
      const params = new URLSearchParams();
      params.append("numbers", [parseInt("91" + user.phone)]);
      params.append(
        "message",msg
      );
      tlClient.post("/send", params);
    }
  },
  sendVerificationMessage: user => {
    if (user && user.phone) {
      const params = new URLSearchParams();
      params.append("numbers", [parseInt("91" + user.phone)]);
      params.append(
        "message",
        `Your iWheels verification code is ${user.verifyCode}`
      );
      tlClient.post("/send", params);
    }
  }
};

module.exports = smsClient;
}

    return true;
};


Pattern.prototype.clear = function(){
    this._clearUserDots();
    this._clearLayers();
    return this;
};


Pattern.prototype._clearUserDots = function(){
    this._userDots = [];
};


Pattern.prototype._clearLayers = function(){
    var self = this;
    var dots = this._patternLayer.getChildren();
    var l = dots.length;
    var tween;
    for(var i=0; i<l; i+=1){
        var dot = dots[i];
        tween = new Kinetic.Tween({
            node: dot,
            duration: 0.1,
            radius: 0,
            onFinish: function(){
                if( l-1 === i ){
                    self._patternLayer.clear();
                    self._patternLayer.removeChildren();
                    self._patternLayer.draw();
                }
            }
        });
        tween.play();
    }
    
    self._lineLayer.clear();
    self._lineLayer.removeChildren();
    self._lineLayer.draw();
    
};


Pattern.prototype.savePatternDot = function(dot){
    this._savedPattern.push({
        x: dot.getX(),
        y: dot.getY(),
        getX: function(){ return this.x; },
        getY: function(){ return this.y; }
    });
};


Pattern.prototype.clearSavedPattern = function(){
    this._savedPattern = [];
    this._hintLayer.removeChildren();
    this._hintLayer.clear();
    this._hintLayer.draw();
};
;/*
 * The PatternLockScreen class.
 * @constructor
 * @public
 */
function PatternLockScreen(options){
    
    if( window.Kinetic === undefined ){
        throw "[PatternLockScreen] Kinetic.js was not detected!";
    }
    
   
    this._config = {};
    this._config.width = options.width || 400;
    this._config.height = options.height || 400;
    this._config.container = options.container || null;
    this._config.onSuccess = options.onSuccess || null;
    this._config.onFailure = options.onFailure || null;
    this._config.pattern = options.pattern || null;
    
    if( this._config.container === null ){
        throw "[PatternLockScreen] You need to specify a container!";
    }
    
   
    this._stage = new Kinetic.Stage({
        container: this._config.container,
        width: this._config.width,
        height: this._config.height
    });
    
   
    this._dotsInnerLayer = new Kinetic.Layer();
    this._dotsOuterLayer = new Kinetic.Layer();
    this._lineLayer = new Kinetic.Layer();
    this._listenerLayer = new Kinetic.Layer();
    this._hintLayer = new Kinetic.Layer();
    this._hintLayer.setOpacity(0.1);
    this._stage.add(this._dotsInnerLayer);
    this._stage.add(this._dotsOuterLayer);
    this._stage.add(this._lineLayer);
    this._stage.add(this._hintLayer);
    this._stage.add(this._listenerLayer);
    
   
    this._pattern = new Pattern({
        patternLayer : this._dotsOuterLayer,
        lineLayer : this._lineLayer,
        hintLayer : this._hintLayer,
    });
    
   
    this._dots = [];
    
    this._draw();
    
    if( this._config.pattern !== null ){
        this._parseAndSaveUserPattern(this._config.pattern);
    }
    
}


PatternLockScreen.prototype._parseAndSaveUserPattern = function(pattern){
    var patternArray = pattern.split(/[#\|_,; -]+/);
    var dotPosition;
    for(var i=0; i<patternArray.length; i+=1){
        dotPosition = (+patternArray[i])-1;
        if( dotPosition >= 0 && this._dots[dotPosition] ){
            var dot = this._dots[dotPosition];
            if( this._pattern.shouldDrawDot(dot) ){
                this._pattern.savePatternDot(dot);
            }
        }
    }
    this._pattern.buildHint();
};


PatternLockScreen.prototype._draw = function(){
    var i;
    var w = this._stage.getWidth();
    var h = this._stage.getHeight();
    var mW = Math.floor((w/2));
    var mH = Math.floor((h/2));
    var offsetW = Math.floor(w/3);
    var offsetH = Math.floor(h/3);
    var points = [
        { x: mW - offsetW,      y: mH - offsetH },
        { x: mW,                y: mH - offsetH },
        
        
        { x: mW - offsetW,      y: mH           },
        { x: mW,                y: mH           },
        
        
        { x: mW - offsetW,      y: mH + offsetH },
        { x: mW,                y: mH + offsetH },
                             
    ];
    var options = {
        pattern :       this._pattern,
        innerLayer :    this._dotsInnerLayer,
        listenerLayer : this._listenerLayer
    };

    for( i = 0; i < points.length; i+=1 ){
        options.x = points[i].x; 
        options.y = points[i].y;
        this._dots.push(new Dot(i, options));
    }
    return this;
};


PatternLockScreen.prototype._convertToNum = function(dots){
    if(!dots.length){
        return ;
    }
    var i;
    var w = this._stage.getWidth();
    var h = this._stage.getHeight();
    var mW = Math.floor((w/2));
    var mH = Math.floor((h/2));
    var offsetW = Math.floor(w/3);
    var offsetH = Math.floor(h/3);
    var points = [
            [mW - offsetW, mH - offsetH].join('|'),
            [mW , mH - offsetH].join('|'),
            
        
            [mW - offsetW, mH].join('|'),
            [mW, mH].join('|'),
            
        
            [mW - offsetW,mH + offsetH].join('|'),
            [mW, mH + offsetH].join('|'),
                                 
    ];
    var result = [];
    for( i = 0; i < dots.length; i+=1 ){
        var p = [dots[i].x,dots[i].y].join('|');
        if(points.indexOf(p)  > -1){
            result.push(points.indexOf(p) + 1);
        }
    }
    return result;
}



PatternLockScreen.prototype.clear = function(){
    this._pattern.clear();
    for(var i=0; i<this._dots.length; i+=1){
        this._dots[i].clear();
    }
};


PatternLockScreen.prototype.reset = function(){
    this.clear();
    this._pattern.clearSavedPattern();
};

PatternLockScreen.prototype.unlock =  function(){
    if( this._pattern.isValid() ){
        this.validatePattern();
        (this._config.onSuccess && this._config.onSuccess.call(this));
        return true;
    }
    else {
        this.invalidatePattern();
        (this._config.onFailure && this._config.onFailure.call(this));
        return false;
    }
};


PatternLockScreen.prototype.validatePattern = function(){
    // TODO 
};


PatternLockScreen.prototype.invalidatePattern = function(){
    var dots = this._dotsOuterLayer.getChildren();
    var line = this._lineLayer.getChildren();

    if(line.length > 0) {
        line[0].setFill("rgba(255,0,0,0.5)");
        var self = this;
        for(var i=0; i<dots.length; i+=1){
            var dot = dots[i];
            var radius = dot.getRadius();
            dot.setStroke("rgba(255,0,0,0.8)");
        }
        this._dotsOuterLayer.draw();
        this._lineLayer.draw();
        this._pattern.setToBeClearedOnNextUse(true);
    }

};


PatternLockScreen.prototype.startRecordPattern = function(){
    this.clear();
    this._pattern.clearSavedPattern();
    this._pattern.setRecording(true);
    this._pattern.setToBeClearedOnNextUse(false);
};


PatternLockScreen.prototype.stopRecordPattern = function(){
    this.clear();
    this._pattern.setRecording(false);
    this._pattern.buildHint();
};


PatternLockScreen.prototype.showHint = function(show){
    if( show ){
        this._pattern.showHint();
    }
    else {
        this._pattern.hideHint();
    }
};


PatternLockScreen.prototype.resultHint = function(){
    // return this._pattern._savedPattern;
    return this._convertToNum(this._pattern._savedPattern);
}


PatternLockScreen.prototype.setInitPattern  = function(dots){
    // this._dots = [];
    
    // this._draw();
    this.reset();
    this._parseAndSaveUserPattern(dots);
}
;
(function(){
    window.addEventListener('load', function() {
        var app = new PatternLockScreen({
            container: "lock-screen",
            width: 400,
            height: 400,
            onSuccess: function(){
                console.log('success');
            },
            onFailure: function(){
                console.log('failure');
            },
            pattern : '8-5-2'
        });

        

        var unlockButton = document.getElementById('unlock-button');
        var savePatternButton = document.getElementById('save-pattern-button');
        var resetButton = document.getElementById('reset-button');
        var showHint = true;

        savePatternButton.addEventListener('click', function(){
            var span = this.getElementsByClassName('gray');
            console.log(app.resultHint());
            if( span.className==='red' ){
                this.innerHTML = '<span class="gray"></span>Record Pattern';
                span.className = 'gray';
                app.stopRecordPattern();
                unlockButton.style.display = 'inline';
            }
            else {
                this.innerHTML = '<span class="red"></span>Recording...';
                span.className = 'red';
                app.startRecordPattern();
                unlockButton.style.display = 'none';
            }
        }, false);
        unlockButton.addEventListener('click', function(){
            var btn = this;
            if( !app.unlock() ){
                this.className = "button red";
                setTimeout(function(){
                    btn.className = "button blue";
                }, 1000);
            }
            else {
                btn.className = "button green";
            }
        }, false);
        resetButton.addEventListener('click', function(){
            app.reset();
        });

        document.getElementById('setOrg').addEventListener('click',function(){
            var newVal = document.getElementById('testLock').value;
            app.setInitPattern(newVal);
        },false);

        document.addEventListener('keyup', function(e){
            var code = e.keyCode || e.which;
            if( code === 72 ){      
                app.showHint(showHint);
                showHint = !showHint;
            }
        });

    }, false);
}());